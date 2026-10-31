import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "@/lib/auth";

export async function userOrResponse() {
  try { return await requireUser(); }
  catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === "FORBIDDEN" ? "Forbidden" : "Authentication required" }, { status: error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401 });
  }
}
export async function adminOrResponse() {
  try { return await requireAdmin(); }
  catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === "UNAUTHORIZED" ? "Authentication required" : "Forbidden" }, { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 403 });
  }
}
