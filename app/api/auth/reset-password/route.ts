import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const parsed = z
    .object({
      token: z.string().min(20).max(200),
      password: z.string().min(10).max(128),
    })
    .safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Use a password with at least 10 characters." },
      { status: 400 },
    );
  const tokenHash = createHash("sha256")
    .update(parsed.data.token)
    .digest("hex");
  const reset = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });
  if (!reset || reset.usedAt || reset.expiresAt < new Date())
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
  ]);
  return NextResponse.json({ data: { reset: true } });
}
