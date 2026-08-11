import { NextResponse } from "next/server";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  try {
    const params = new URL(request.url).searchParams;
    const query = params.get("q")?.trim();
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const take = Math.min(100, Math.max(1, Number(params.get("limit") ?? 25)));
    const where = {
      role: "CUSTOMER" as const,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
              { phone: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          wallet: { select: { balance: true } },
          _count: { select: { orders: true, addresses: true } },
          orders: {
            select: { total: true },
            where: { paymentStatus: { in: ["PAID", "PARTIALLY_REFUNDED"] } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * take,
        take,
      }),
      prisma.user.count({ where }),
    ]);
    return NextResponse.json({
      data: customers.map(({ orders, ...customer }) => ({
        ...customer,
        walletBalance: Number(customer.wallet?.balance ?? 0),
        lifetimeValue: orders.reduce(
          (sum, order) => sum + Number(order.total),
          0,
        ),
      })),
      meta: { page, total, pages: Math.max(1, Math.ceil(total / take)) },
    });
  } catch (caught) {
    return adminError(caught);
  }
}
