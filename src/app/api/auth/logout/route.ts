import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { assertSameOrigin, jsonError, serverError } from "@/lib/http";
export async function POST(request:Request){
 try{if(!assertSameOrigin(request))return jsonError("Invalid request origin.",403);await destroySession();return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});}
 catch(e){return serverError(e);}
}