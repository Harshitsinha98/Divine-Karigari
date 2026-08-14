import { NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";
import { sendTransactionalEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().trim().email().max(254),
});

const hashCode = (code: string) =>
  createHash("sha256").update(code).digest("hex");

export async function POST(request: Request) {
  const session = await accountSession();
  if (!session) return accountUnauthorized();

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );

  const email = parsed.data.email.toLowerCase();

  // Ensure email isn't already used by another account
  const existing = await prisma.user.findFirst({
    where: { email, id: { not: session.id } },
  });
  if (existing)
    return NextResponse.json(
      { error: "This email is already linked to another account." },
      { status: 409 },
    );

  // Generate 6-digit code
  const code = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Clear old codes and store new
  await prisma.emailOtp.deleteMany({ where: { userId: session.id } });
  await prisma.emailOtp.create({
    data: {
      userId: session.id,
      email,
      codeHash: hashCode(code),
      expiresAt,
    },
  });

  let result: { sent: boolean; reason?: string; id?: string };
  try {
    result = await sendTransactionalEmail({
      to: email,
      subject: "Verify your email · Divine Karigari",
      preheader: `Your verification code is ${code}`,
      heading: "Confirm your email address",
      body: `Your verification code is <strong style="font-size:22px;letter-spacing:3px">${code}</strong>. It expires in 10 minutes. If you didn't request this, you can safely ignore this email.`,
    });
  } catch (error) {
    console.error("[verify-email] send failed", error);
    result = {
      sent: false,
      reason: error instanceof Error ? error.message : "Email provider error.",
    };
  }

  if (!result.sent) {
    // In dev without email configured, return the code so it can be tested
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ data: { sent: false, devCode: code } });
    }
    return NextResponse.json(
      { error: "Unable to send verification email right now." },
      { status: 502 },
    );
  }

  return NextResponse.json({ data: { sent: true } });
}
