import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminOrResponse } from "@/lib/guards";
import { productSchema } from "@/lib/validation";
import { assertSameOrigin, jsonError, serverError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function GET(){
 const admin=await adminOrResponse();if(admin instanceof NextResponse)return admin;
 const products=await prisma.product.findMany({include:{images:true,variants:true},orderBy:{createdAt:"desc"}});
 return NextResponse.json({products},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request:Request){
 try{
  const admin=await adminOrResponse();if(admin instanceof NextResponse)return admin;
  if(!assertSameOrigin(request))return jsonError("Invalid request origin.",403);
  if(!await enforceRateLimit(`admin-products:${admin.id}`,30,60))return jsonError("Too many product changes. Please wait and try again.",429);
  const parsed=productSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return jsonError("Invalid product details.",400);
  const {images,variants,...data}=parsed.data;
  const product=await prisma.product.create({data:{
    ...data,
    compareAtPaise:data.compareAtPaise ?? null,
    images:{create:images.map((image,position)=>({...image,position}))},
    variants:{create:variants.map(({sku,size,color,stock})=>({sku,size,color,stock}))}
  },include:{images:true,variants:true}});
  return NextResponse.json({product},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(error){
  if(isUniqueConstraintError(error))return jsonError("A product slug or SKU is already in use.",409);
  return serverError(error);
 }
}