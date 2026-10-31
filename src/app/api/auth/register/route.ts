import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { createSession } from "@/lib/auth";
import { assertSameOrigin, jsonError, serverError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
export async function POST(request:Request){
 try{
  if(!assertSameOrigin(request))return jsonError("Invalid request origin.",403);
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  if(!await enforceRateLimit(`register:${ip}`,5,3600))return jsonError("Too many attempts. Try again later.",429);
  const parsed=registerSchema.safeParse(await request.json());if(!parsed.success)return jsonError("Please check your details.",400);
  const {name,email,password}=parsed.data;
  if(await prisma.user.findUnique({where:{email}}))return jsonError("Unable to create account with those details.",409);
  const passwordHash=await bcrypt.hash(password,12);
  const user=await prisma.user.create({data:{name,email,passwordHash,cart:{create:{}}},select:{id:true}});
  await createSession(user.id);
  return NextResponse.json({ok:true},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(e){return serverError(e);}
}