import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userOrResponse } from "@/lib/guards";
import { assertSameOrigin, jsonError, serverError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { randomUUID } from "node:crypto";
import { shippingAddressSchema } from "@/lib/validation";
export async function POST(request:Request){
 try{
  const user=await userOrResponse();if(user instanceof NextResponse)return user;
  if(!assertSameOrigin(request))return jsonError("Invalid request origin.",403);
  if(!await enforceRateLimit(`checkout:${user.id}`,5,300))return jsonError("Please wait before trying again.",429);
  const body=await request.json().catch(()=>null);
  const addressResult=shippingAddressSchema.safeParse(body?.address);
  if(!addressResult.success)return jsonError("A valid shipping address is required.",400);
  const address=addressResult.data;
  const cart=await prisma.cart.findUnique({where:{userId:user.id},include:{items:{include:{variant:{include:{product:true}}}}}});
  if(!cart?.items.length)return jsonError("Your bag is empty.",400);
  if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET)return jsonError("Online payments are not configured yet.",503);
  const subtotal=cart.items.reduce((sum,item)=>sum+item.variant.product.pricePaise*item.quantity,0);
  const orderNumber=`AN-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0,6).toUpperCase()}`;
  const order=await prisma.$transaction(async tx=>{
    for(const item of cart.items){
      const updated=await tx.$executeRaw`UPDATE "ProductVariant" SET "reserved" = "reserved" + ${item.quantity} WHERE "id" = ${item.variantId} AND "stock" - "reserved" >= ${item.quantity}`;
      if(updated!==1)throw new Error("STOCK_UNAVAILABLE");
    }
    const created=await tx.order.create({data:{orderNumber,userId:user.id,subtotalPaise:subtotal,totalPaise:subtotal,shippingAddress:address,items:{create:cart.items.map(i=>({productId:i.variant.productId,variantId:i.variantId,productName:i.variant.product.name,sku:i.variant.sku,size:i.variant.size,quantity:i.quantity,unitPricePaise:i.variant.product.pricePaise}))}}});
    return created;
  });
  const auth=Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const paymentRes=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{"Authorization":`Basic ${auth}`,"Content-Type":"application/json"},body:JSON.stringify({amount:subtotal,currency:"INR",receipt:order.orderNumber,notes:{orderId:order.id}}),cache:"no-store"});
  if(!paymentRes.ok)throw new Error("PAYMENT_PROVIDER_ERROR");
  const payment=await paymentRes.json();
  await prisma.order.update({where:{id:order.id},data:{razorpayOrderId:payment.id}});
  await prisma.payment.create({data:{orderId:order.id,status:"created",amountPaise:subtotal}});
  return NextResponse.json({orderId:order.id,orderNumber:order.orderNumber,razorpayOrderId:payment.id,amount:subtotal,currency:"INR",keyId:process.env.RAZORPAY_KEY_ID},{headers:{"Cache-Control":"no-store"}});
 }catch(e){if(e instanceof Error&&e.message==="STOCK_UNAVAILABLE")return jsonError("One or more items are no longer available.",409);return serverError(e);}
}