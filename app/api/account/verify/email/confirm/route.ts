import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";

const schema = z.object({
  code: z.string().trim().length(6),
});

const hashCode = (code: string) =>
  createHash("sha256").update(code).digest("hex");

export async function POST(request: Request) {
  const session = await accountSession();
  if (!session) return accountUnauthorized();

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter the 6-digit code." },
      { status: 400 },
    );

  const otp = await prisma.emailOtp.findFirst({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  if (!otp || otp.expiresAt < new Date())
    return NextResponse.json(
      { error: "Code expired. Please request a new one." },
      { status: 400 },
    );

  if (otp.codeHash !== hashCode(parsed.data.code))
    return NextResponse.json(
      { error: "Incorrect code. Please try again." },
      { status: 401 },
    );

  // Update user: set the verified email + emailVerified flag
  await prisma.user.update({
    where: { id: session.id },
    data: { email: otp.email, emailVerified: true },
  });
  await prisma.emailOtp.deleteMany({ where: { userId: session.id } });

  return NextResponse.json({ data: { verified: true, email: otp.email } });
}
