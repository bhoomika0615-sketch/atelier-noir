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
  const appUrl = process.env.APP_URL;
  if (!origin || !appUrl) return false;
  try { return new URL(origin).origin === new URL(appUrl).origin; } catch { return false; }
}
