import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { setAdminSessionCookie } from "@/lib/admin-auth";

const SUPER_ADMIN_EMAIL = (
  process.env.ADMIN_GOOGLE_EMAIL ?? "divinekarigari@gmail.com"
).toLowerCase();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  if (!code) {
    console.error("[admin-callback] No code received:", Object.fromEntries(searchParams.entries()));
    return NextResponse.redirect(
      new URL("/admin/login?error=no_code", appUrl),
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[admin-callback] Supabase env vars missing");
    return NextResponse.redirect(
      new URL("/admin/login?error=server_error", appUrl),
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user?.email) {
      console.error("[admin-callback] Code exchange failed:", error?.message);
      return NextResponse.redirect(
        new URL("/admin/login?error=auth_failed", appUrl),
      );
    }

    const email = data.user.email.toLowerCase();
    const displayName =
      (data.user.user_metadata?.full_name as string) ??
      (data.user.user_metadata?.name as string) ??
      email.split("@")[0];

    // ── SUPER_ADMIN auto-provisioning ──
    if (email === SUPER_ADMIN_EMAIL) {
      let user = await prisma.user.findUnique({
        where: { email },
        include: { staffProfile: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: displayName,
            authProvider: "google",
            emailVerified: true,
            role: "STAFF",
            staffProfile: { create: { role: "SUPER_ADMIN", active: true } },
          },
          include: { staffProfile: true },
        });
      } else if (user.role !== "STAFF" || !user.staffProfile) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "STAFF", name: user.name ?? displayName },
        });
        if (!user.staffProfile) {
          await prisma.staff.create({
            data: { userId: user.id, role: "SUPER_ADMIN", active: true },
          });
        }
        user = await prisma.user.findUnique({
          where: { email },
          include: { staffProfile: true },
        });
      } else if (!user.staffProfile.active) {
        await prisma.staff.update({
          where: { id: user.staffProfile.id },
          data: { active: true },
        });
        user = await prisma.user.findUnique({
          where: { email },
          include: { staffProfile: true },
        });
      }

      if (!user?.staffProfile) {
        return NextResponse.redirect(
          new URL("/admin/login?error=setup_failed", appUrl),
        );
      }

      const response = NextResponse.redirect(new URL(next, appUrl));
      await setAdminSessionCookie(response, {
        id: user.id,
        email: user.email,
        staffId: user.staffProfile.id,
        role: user.staffProfile.role,
      });
      return response;
    }

    // ── Other staff members: must exist with active Staff profile ──
    const user = await prisma.user.findUnique({
      where: { email },
      include: { staffProfile: true },
    });

    if (
      !user ||
      user.role !== "STAFF" ||
      !user.staffProfile ||
      !user.staffProfile.active
    ) {
      console.warn(`[admin-callback] Rejected: ${email} — not registered staff.`);
      return NextResponse.redirect(
        new URL("/admin/login?error=not_authorized", appUrl),
      );
    }

    const response = NextResponse.redirect(new URL(next, appUrl));
    await setAdminSessionCookie(response, {
      id: user.id,
      email: user.email,
      staffId: user.staffProfile.id,
      role: user.staffProfile.role,
    });
    return response;
  } catch (err) {
    console.error("[admin-callback] Unexpected error:", err);
    return NextResponse.redirect(
      new URL("/admin/login?error=auth_failed", appUrl),
    );
  }
}
