import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
export function serverError(error: unknown) {
  console.error("[server-error]", error);
  return jsonError("Something went wrong. Please try again later.", 500);
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigins = process.env.APP_URLS?.split(",").map((value) => value.trim()).filter(Boolean)
    ?? (process.env.APP_URL ? [process.env.APP_URL] : []);
  if (!origin || !allowedOrigins.length) return false;
  try {
    const requestOrigin = new URL(origin).origin;
    return allowedOrigins.some((value) => new URL(value).origin === requestOrigin);
  } catch {
    return false;
  }
}
