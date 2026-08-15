import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { setAdminSessionCookie } from "@/lib/admin-auth";

const SUPER_ADMIN_EMAIL = (
  process.env.ADMIN_GOOGLE_EMAIL ?? "divinekarigari@gmail.com"
).toLowerCase();

// Receives the access_token from the client-side hash fragment extraction,
// verifies it with Supabase, and creates an admin session if authorized.
export async function POST(request: Request) {
  try {
    const { access_token } = await request.json();
    if (!access_token || typeof access_token !== "string") {
      return NextResponse.json(
        { error: "Missing access token." },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server not configured." },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the token and get the user
    const { data, error } = await supabase.auth.getUser(access_token);
    if (error || !data.user?.email) {
      console.error("[admin-token] getUser failed:", error?.message);
      return NextResponse.json(
        { error: "Invalid or expired token. Please try again." },
        { status: 401 },
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
        return NextResponse.json(
          { error: "Failed to set up admin account." },
          { status: 500 },
        );
      }

      const response = NextResponse.json({ success: true });
      await setAdminSessionCookie(response, {
        id: user.id,
        email: user.email,
        staffId: user.staffProfile.id,
        role: user.staffProfile.role,
      });
      return response;
    }

    // ── Other staff members ──
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
      return NextResponse.json(
        {
          error:
            "Access denied. Your Google account is not registered as staff. Contact the admin.",
        },
        { status: 403 },
      );
    }

    const response = NextResponse.json({ success: true });
    await setAdminSessionCookie(response, {
      id: user.id,
      email: user.email,
      staffId: user.staffProfile.id,
      role: user.staffProfile.role,
    });
    return response;
  } catch (err) {
    console.error("[admin-token] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
