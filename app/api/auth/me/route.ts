import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
export async function GET() {
  const user = await getSessionUser();
  return user
    ? NextResponse.json({ data: user })
    : NextResponse.json({ data: null }, { status: 401 });
}
