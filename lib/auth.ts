import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session-constants";

export { SESSION_COOKIE };
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "development-only-change-me",
);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
export async function createSessionToken(user: {
  id: string;
  email: string;
  role: string;
}) {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}
export async function readSessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.sub
      ? {
          id: payload.sub,
          email: String(payload.email ?? ""),
          role: String(payload.role ?? "CUSTOMER"),
        }
      : null;
  } catch {
    return null;
  }
}
export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? readSessionToken(token) : null;
}
export async function setSessionCookie(
  response: Response,
  user: { id: string; email: string; role: string },
) {
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${await createSessionToken(user)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}
