import { NextResponse } from "next/server";
import { z } from "zod";
import { comparePassword, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";
export async function PATCH(request: Request) {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  const parsed = z
    .object({
      currentPassword: z.string().max(128),
      newPassword: z.string().min(10).max(128),
    })
    .safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Use a password with at least 10 characters." },
      { status: 400 },
    );
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (
    !user?.passwordHash ||
    !(await comparePassword(parsed.data.currentPassword, user.passwordHash))
  )
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 },
    );
  await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  return NextResponse.json({ data: { updated: true } });
}
