import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function requireAccountUser() {
  return getSessionUser();
}
export async function unauthorized() {
  return NextResponse.json(
    { error: "Authentication required" },
    { status: 401 },
  );
}
