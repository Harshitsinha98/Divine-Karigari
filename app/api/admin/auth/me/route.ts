import { NextResponse } from "next/server";
import { getActiveAdmin } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getActiveAdmin();
  return admin
    ? NextResponse.json({ data: admin })
    : NextResponse.json({ data: null }, { status: 401 });
}
