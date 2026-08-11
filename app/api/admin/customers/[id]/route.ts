import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  const customer = await prisma.user.findFirst({
    where: { id: params.id, role: "CUSTOMER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      notificationPreferences: true,
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      wallet: {
        include: { transactions: { orderBy: { createdAt: "desc" }, take: 30 } },
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return customer
    ? NextResponse.json({ data: customer })
    : NextResponse.json({ error: "Customer not found" }, { status: 404 });
}
