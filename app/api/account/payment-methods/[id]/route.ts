import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  await prisma.savedPaymentMethod.delete({
    where: { id: params.id, userId: session.id },
  });
  return NextResponse.json({ data: { deleted: true } });
}
