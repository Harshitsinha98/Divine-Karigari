import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";
export async function GET() {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  return NextResponse.json({
    data: await prisma.review.findMany({
      where: { userId: session.id },
      include: {
        product: { select: { name: true, slug: true, images: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  });
}
