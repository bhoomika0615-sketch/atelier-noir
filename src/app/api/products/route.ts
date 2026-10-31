import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(request:Request){
 try{
  const url=new URL(request.url);const category=url.searchParams.get("category")?.slice(0,60);
  const products=await prisma.product.findMany({where:{published:true,...(category?{category}:{})},select:{id:true,slug:true,name:true,description:true,category:true,pricePaise:true,images:{select:{url:true,alt:true},orderBy:{position:"asc"},take:3},variants:{select:{id:true,size:true,stock:true}}},orderBy:{createdAt:"desc"},take:60});
  return NextResponse.json({products},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=300"}});
 }catch(error){console.error("[products]",error);return NextResponse.json({error:"Unable to load products."},{status:500});}
}