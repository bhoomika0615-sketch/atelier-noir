import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userOrResponse } from "@/lib/guards";
import { cartSchema } from "@/lib/validation";
import { assertSameOrigin, jsonError, serverError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
export async function POST(request:Request){
 try{
  const user=await userOrResponse();if(user instanceof NextResponse)return user;
  if(!assertSameOrigin(request))return jsonError("Invalid request origin.",403);
  if(!await enforceRateLimit(`cart:${user.id}`,30,60))return jsonError("Too many requests.",429);
  const parsed=cartSchema.safeParse(await request.json());if(!parsed.success)return jsonError("Invalid cart item.",400);
  const variant=await prisma.productVariant.findUnique({where:{id:parsed.data.variantId},include:{product:true}});
  if(!variant||!variant.product.published||variant.stock-variant.reserved<parsed.data.quantity)return jsonError("This size is currently unavailable.",409);
  const cart=await prisma.cart.upsert({where:{userId:user.id},create:{userId:user.id},update:{}});
  await prisma.cartItem.upsert({where:{cartId_variantId:{cartId:cart.id,variantId:variant.id}},create:{cartId:cart.id,variantId:variant.id,quantity:parsed.data.quantity},update:{quantity:parsed.data.quantity}});
  return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return serverError(e);}
}