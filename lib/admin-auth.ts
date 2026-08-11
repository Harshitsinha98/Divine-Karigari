import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { StaffRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const ADMIN_SESSION_COOKIE = "divine_admin_session";

const adminSecret = new TextEncoder().encode(
  `${process.env.AUTH_SECRET ?? "development-only-change-me"}:admin`,
);

export type AdminSession = {
  id: string;
  email: string;
  staffId: string;
  role: StaffRole;
};

export async function createAdminSessionToken(admin: AdminSession) {
  return new SignJWT({
    email: admin.email,
    staffId: admin.staffId,
    role: admin.role,
    scope: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(adminSecret);
}

export async function readAdminSessionToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, adminSecret);
    if (
      !payload.sub ||
      payload.scope !== "admin" ||
      !payload.staffId ||
      !payload.role
    )
      return null;
    return {
      id: payload.sub,
      email: String(payload.email ?? ""),
      staffId: String(payload.staffId),
      role: String(payload.role) as StaffRole,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return token ? readAdminSessionToken(token) : null;
}

export async function getActiveAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  const staff = await prisma.staff.findFirst({
    where: {
      id: session.staffId,
      userId: session.id,
      active: true,
      user: { role: "STAFF" },
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!staff || staff.role !== session.role) return null;
  return { ...session, name: staff.user.name, role: staff.role };
}

export async function setAdminSessionCookie(
  response: Response,
  admin: AdminSession,
) {
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=${await createAdminSessionToken(admin)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}

export function hasAdminRole(role: StaffRole, allowed: readonly StaffRole[]) {
  return role === "SUPER_ADMIN" || allowed.includes(role);
}
