import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
export async function accountSession() {
  return getSessionUser();
}
export async function accountUnauthorized() {
  return NextResponse.json(
    { error: "Authentication required" },
    { status: 401 },
  );
}
