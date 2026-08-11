import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, sendTransactionalEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/sanitize";

export async function POST(request: Request) {
  const parsed = z
    .object({ email: z.string().email() })
    .safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({
      message: "If an account exists, reset instructions are on their way.",
    });
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });
    const resetUrl = absoluteUrl(
      `/reset-password?token=${encodeURIComponent(token)}`,
    );
    try {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Reset your Divine Karigari password",
        preheader: "Your password reset link expires in 30 minutes.",
        heading: "Choose a new password.",
        body: `<p style="margin:0">We received a password reset request for <strong>${escapeHtml(
          user.email,
        )}</strong>. This link expires in 30 minutes. If you did not request it, you can ignore this email.</p>`,
        action: { label: "Reset password", url: resetUrl },
      });
    } catch (error) {
      console.error("[password-reset-email]", error);
    }
  }
  return NextResponse.json({
    message: "If an account exists, reset instructions are on their way.",
  });
}
