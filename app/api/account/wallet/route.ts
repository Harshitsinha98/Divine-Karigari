import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";
export async function GET() {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.id },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  return NextResponse.json({
    data: wallet
      ? {
          ...wallet,
          balance: Number(wallet.balance),
          transactions: wallet.transactions.map((item) => ({
            ...item,
            amount: Number(item.amount),
          })),
        }
      : { balance: 0, transactions: [] },
  });
}
