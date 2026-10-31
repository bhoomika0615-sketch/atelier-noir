import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(request:Request){
 const secret=process.env.RAZORPAY_WEBHOOK_SECRET;
 if(!secret)return NextResponse.json({error:"Webhook unavailable."},{status:503});
 const raw=await request.text();const signature=request.headers.get("x-razorpay-signature")||"";
 const expected=createHmac("sha256",secret).update(raw).digest("hex");
 const a=Buffer.from(signature);const b=Buffer.from(expected);
 if(a.length!==b.length||!timingSafeEqual(a,b))return NextResponse.json({error:"Invalid signature."},{status:400});
 try{
  const event=JSON.parse(raw);const eventId=request.headers.get("x-razorpay-event-id");
  if(!eventId)return NextResponse.json({error:"Missing event id."},{status:400});
  await prisma.$transaction(async tx=>{
   const seen=await tx.webhookEvent.findUnique({where:{id:eventId}});if(seen)return;
   await tx.webhookEvent.create({data:{id:eventId}});
   const paymentEntity=event.payload?.payment?.entity;
   const razorpayOrderId=paymentEntity?.order_id;
   if(!razorpayOrderId)return;
   const order=await tx.order.findUnique({where:{razorpayOrderId},include:{items:true}});
   if(!order)return;
   if(event.event==="payment.captured"){
    await tx.order.update({where:{id:order.id},data:{status:"PAID"}});
    await tx.payment.update({where:{orderId:order.id},data:{status:"captured",providerPaymentId:paymentEntity.id}});
    for(const item of order.items)await tx.productVariant.update({where:{id:item.variantId},data:{stock:{decrement:item.quantity},reserved:{decrement:item.quantity}}});
    await tx.cartItem.deleteMany({where:{cart:{userId:order.userId}}});
   }
   if(event.event==="payment.failed"){
    await tx.order.update({where:{id:order.id},data:{status:"CANCELLED"}});
    await tx.payment.update({where:{orderId:order.id},data:{status:"failed"}});
    for(const item of order.items)await tx.productVariant.update({where:{id:item.variantId},data:{stock:{increment:item.quantity},reserved:{decrement:item.quantity}}});
   }
  });
  return NextResponse.json({received:true});
 }catch(error){console.error("[payment-webhook]",error);return NextResponse.json({error:"Webhook processing failed."},{status:500});}
}