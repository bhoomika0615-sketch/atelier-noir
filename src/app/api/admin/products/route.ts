import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminOrResponse } from "@/lib/guards";
import { productSchema } from "@/lib/validation";
import { assertSameOrigin, jsonError, serverError } from "@/lib/http";
export async function GET(){
 const admin=await adminOrResponse();if(admin instanceof NextResponse)return admin;
 const products=await prisma.product.findMany({include:{images:true,variants:true},orderBy:{createdAt:"desc"}});
 return NextResponse.json({products},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request:Request){
 try{
  const admin=await adminOrResponse();if(admin instanceof NextResponse)return admin;
  if(!assertSameOrigin(request))return jsonError("Invalid request origin.",403);
  const parsed=productSchema.safeParse(await request.json());if(!parsed.success)return jsonError("Invalid product details.",400);
  const {images,...data}=parsed.data;
  const product=await prisma.product.create({data:{...data,images:{create:images.map((image,position)=>({...image,position}))}}});
  return NextResponse.json({product},{status:201});
 }catch(e){return serverError(e);}
}