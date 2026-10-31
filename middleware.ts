import { NextRequest, NextResponse } from "next/server";
export function middleware(request:NextRequest){
 const response=NextResponse.next();
 if(process.env.NODE_ENV==="production"&&request.nextUrl.protocol!=="https:"){
  const url=request.nextUrl.clone();url.protocol="https:";return NextResponse.redirect(url,308);
 }
 const protectedPath=request.nextUrl.pathname.startsWith("/account")||request.nextUrl.pathname.startsWith("/admin");
 const isAdminLogin=request.nextUrl.pathname==="/admin/login";
 const cookie=request.cookies.get("__Host-atn_session")?.value||request.cookies.get("atn_session")?.value;
 if(protectedPath&&!isAdminLogin&&!cookie){
  const url=request.nextUrl.clone();url.pathname=request.nextUrl.pathname.startsWith("/admin")?"/admin/login":"/login";return NextResponse.redirect(url);
 }
 response.headers.set("Cache-Control","no-store");
 return response;
}
export const config={matcher:["/account/:path*","/admin/:path*","/((?!_next/static|_next/image|favicon.ico).*)"]};