import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { createSession } from "@/lib/auth";
import { assertSameOrigin, jsonError, serverError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
export async function POST(request:Request){
 try{
  if(!assertSameOrigin(request))return jsonError("Invalid request origin.",403);
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  if(!await enforceRateLimit(`login:${ip}`,8,900))return jsonError("Too many attempts. Try again later.",429);
  const parsed=loginSchema.safeParse(await request.json());if(!parsed.success)return jsonError("Invalid email or password.",400);
  const user=await prisma.user.findUnique({where:{email:parsed.data.email}});
  if(!user||!await bcrypt.compare(parsed.data.password,user.passwordHash))return jsonError("Invalid email or password.",401);
  await createSession(user.id);
  return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return serverError(e);}
}