import type { StaffRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
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
  // Return human-readable validation errors from Zod
  if (error instanceof ZodError) {
    const messages = error.issues.map(
      (issue) => `${issue.path.join(" → ") || "input"}: ${issue.message}`,
    );
    return NextResponse.json(
      { error: messages.join("; ") },
      { status: 400 },
    );
  }
  console.error(error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Something went wrong." },
    { status: 500 },
  );
}
