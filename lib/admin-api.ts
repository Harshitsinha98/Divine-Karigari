import type { StaffRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getActiveAdmin, hasAdminRole } from "@/lib/admin-auth";

export async function requireAdmin(allowed?: readonly StaffRole[]) {
  const admin = await getActiveAdmin();
  if (!admin)
    return {
      admin: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  if (allowed && !hasAdminRole(admin.role, allowed))
    return {
      admin: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  return { admin, error: null };
}

export function adminError(error: unknown) {
  console.error(error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Something went wrong." },
    { status: 500 },
  );
}
