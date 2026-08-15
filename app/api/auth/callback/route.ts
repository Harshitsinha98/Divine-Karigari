import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { setAdminSessionCookie } from "@/lib/admin-auth";

const SUPER_ADMIN_EMAIL = (
  process.env.ADMIN_GOOGLE_EMAIL ?? "divinekarigari@gmail.com"
).toLowerCase();

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";
  const isAdminFlow = searchParams.get("admin") === "1";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  if (!code) {
    console.error("[auth-callback] No code received. Params:", Object.fromEntries(searchParams.entries()));
    return NextResponse.redirect(new URL(`/login?error=missing_code`, appUrl));
  }

  try {
    // Use service_role key to exchange code — works server-side without cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Exchange authorization code for user session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.user) {
      console.error("[auth-callback] Code exchange failed:", sessionError?.message);

      // Fallback: try to get user by the code as an access token
      const { data: userData, error: userError } =
        await supabase.auth.getUser(code);

      if (userError || !userData.user) {
        console.error("[auth-callback] Fallback also failed:", userError?.message);
        return NextResponse.redirect(new URL(`/login?error=auth_failed`, appUrl));
      }

      // Use fallback user data
      return await handleUser(userData.user, next, appUrl, isAdminFlow);
    }

    return await handleUser(sessionData.user, next, appUrl, isAdminFlow);
  } catch (err) {
    console.error("[auth-callback] Unexpected error:", err);
    const errorRedirect = isAdminFlow ? "/admin/login?error=auth_failed" : "/login?error=server_error";
    return NextResponse.redirect(new URL(errorRedirect, appUrl));
  }
}

async function handleUser(
  supabaseUser: { email?: string; user_metadata?: Record<string, unknown> },
  next: string,
  appUrl: string,
  isAdminFlow = false,
) {
  const email =
    supabaseUser.email ??
    (supabaseUser.user_metadata?.email as string | undefined);
  const name =
    (supabaseUser.user_metadata?.full_name as string | undefined) ??
    (supabaseUser.user_metadata?.name as string | undefined);

  if (!email) {
    console.error("[auth-callback] No email from provider");
    const errorRedirect = isAdminFlow ? "/admin/login?error=no_email" : "/login?error=no_email";
    return NextResponse.redirect(new URL(errorRedirect, appUrl));
  }

  const normalizedEmail = email.toLowerCase();

  // ── ADMIN FLOW: authenticate as staff ──
  if (isAdminFlow) {
    return handleAdminUser(normalizedEmail, name ?? email.split("@")[0], next, appUrl);
  }

  // ── CUSTOMER FLOW (existing) ──

  // Find or create user in our database
  let user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name ?? null,
        authProvider: "google",
        wallet: { create: {} },
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });
  } else if (!user.authProvider || user.authProvider === "email") {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        authProvider: "google",
        name: user.name ?? name ?? null,
      },
    });
  }

  // Create our app session (JWT cookie) and redirect
  const response = NextResponse.redirect(new URL(next, appUrl));
  await setSessionCookie(response, {
    id: user.id,
    email: user.email,
    role: user.role,
  });
  return response;
}



// ── Admin Google OAuth handler ──
async function handleAdminUser(
  email: string,
  name: string,
  next: string,
  appUrl: string,
) {
  // Auto-provision SUPER_ADMIN for the designated email
  if (email === SUPER_ADMIN_EMAIL) {
    let user = await prisma.user.findUnique({
      where: { email },
      include: { staffProfile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
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
        data: { role: "STAFF" },
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

  // For all other emails: must be an existing active staff member
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
    console.warn(
      `[admin-google-callback] Rejected: ${email} — not a registered active staff member.`,
    );
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
}
