import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userOrResponse } from "@/lib/guards";
export async function GET(){
 const user=await userOrResponse();if(user instanceof NextResponse)return user;
 const cart=await prisma.cart.findUnique({where:{userId:user.id},include:{items:{include:{variant:{include:{product:{select:{name:true,slug:true,pricePaise:true}}}}}}}});
 return NextResponse.json({cart},{headers:{"Cache-Control":"no-store"}});
}