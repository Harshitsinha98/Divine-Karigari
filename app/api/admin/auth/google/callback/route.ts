import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { setAdminSessionCookie } from "@/lib/admin-auth";

// Only this email is allowed to sign in as admin via Google OAuth.
const ALLOWED_ADMIN_EMAIL = (
  process.env.ADMIN_GOOGLE_EMAIL ?? "divinekarigari@gmail.com"
).toLowerCase();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=no_code", appUrl),
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[admin-google-callback] Supabase not configured");
    return NextResponse.redirect(
      new URL("/admin/login?error=server_error", appUrl),
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Exchange the authorization code for user info
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user?.email) {
    console.error("[admin-google-callback] Exchange failed:", error);
    return NextResponse.redirect(
      new URL("/admin/login?error=auth_failed", appUrl),
    );
  }

  const email = data.user.email.toLowerCase();

  // Strict email check — only the designated admin email is allowed
  if (email !== ALLOWED_ADMIN_EMAIL) {
    console.warn(
      `[admin-google-callback] Rejected login attempt from: ${email}`,
    );
    return NextResponse.redirect(
      new URL("/admin/login?error=not_authorized", appUrl),
    );
  }

  // Find the corresponding User + Staff profile
  const user = await prisma.user.findUnique({
    where: { email },
    include: { staffProfile: true },
  });

  if (!user || user.role !== "STAFF" || !user.staffProfile?.active) {
    // Auto-create/promote if the user exists but isn't staff yet,
    // OR create from scratch for the designated admin email.
    let staffUser = user;
    if (!staffUser) {
      staffUser = await prisma.user.create({
        data: {
          email,
          name: data.user.user_metadata?.full_name ?? "Admin",
          authProvider: "google",
          emailVerified: true,
          role: "STAFF",
          staffProfile: { create: { role: "SUPER_ADMIN", active: true } },
        },
        include: { staffProfile: true },
      });
    } else if (!staffUser.staffProfile) {
      await prisma.user.update({
        where: { id: staffUser.id },
        data: { role: "STAFF" },
      });
      const profile = await prisma.staff.create({
        data: { userId: staffUser.id, role: "SUPER_ADMIN", active: true },
      });
      staffUser = {
        ...staffUser,
        role: "STAFF",
        staffProfile: profile,
      } as typeof staffUser;
    } else if (!staffUser.staffProfile.active) {
      await prisma.staff.update({
        where: { id: staffUser.staffProfile.id },
        data: { active: true },
      });
      staffUser = {
        ...staffUser,
        staffProfile: { ...staffUser.staffProfile, active: true },
      };
    }

    if (!staffUser?.staffProfile) {
      return NextResponse.redirect(
        new URL("/admin/login?error=setup_failed", appUrl),
      );
    }

    const response = NextResponse.redirect(new URL(next, appUrl));
    await setAdminSessionCookie(response, {
      id: staffUser.id,
      email: staffUser.email,
      staffId: staffUser.staffProfile.id,
      role: staffUser.staffProfile.role,
    });
    return response;
  }

  // User exists and is an active staff member
  const response = NextResponse.redirect(new URL(next, appUrl));
  await setAdminSessionCookie(response, {
    id: user.id,
    email: user.email,
    staffId: user.staffProfile.id,
    role: user.staffProfile.role,
  });
  return response;
}
