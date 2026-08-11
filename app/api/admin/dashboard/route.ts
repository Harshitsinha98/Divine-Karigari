import { NextResponse } from "next/server";
import { requireAdmin, adminError } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "daily";
    const days = range === "monthly" ? 365 : range === "weekly" ? 84 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [orderStatuses, paidOrders, lowStock, recentOrders, topProducts] =
      await Promise.all([
        prisma.order.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
        prisma.order.findMany({
          where: {
            paymentStatus: { in: ["PAID", "PARTIALLY_REFUNDED"] },
            createdAt: { gte: since },
          },
          select: { total: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        }),
        prisma.product.findMany({
          where: { status: "ACTIVE", stock: { lte: 10 } },
          select: { id: true, name: true, sku: true, stock: true },
          orderBy: { stock: "asc" },
          take: 8,
        }),
        prisma.order.findMany({
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.product.findMany({
          where: { status: { not: "ARCHIVED" } },
          select: {
            id: true,
            name: true,
            sku: true,
            salesCount: true,
            stock: true,
          },
          orderBy: { salesCount: "desc" },
          take: 6,
        }),
      ]);

    const formatKey = (date: Date) => {
      if (range === "monthly")
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (range === "weekly") {
        const week = new Date(date);
        week.setDate(date.getDate() - date.getDay());
        return week.toISOString().slice(0, 10);
      }
      return date.toISOString().slice(0, 10);
    };
    const revenueMap = new Map<string, number>();
    paidOrders.forEach((order) => {
      const key = formatKey(order.createdAt);
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + Number(order.total));
    });

    const canViewOrders = admin!.role !== "INVENTORY_MANAGER";
    return NextResponse.json({
      data: {
        role: admin!.role,
        revenue: canViewOrders
          ? Array.from(revenueMap.entries()).map(([label, value]) => ({
              label,
              value,
            }))
          : [],
        orderStatuses: canViewOrders ? orderStatuses : [],
        lowStock,
        recentOrders: canViewOrders
          ? recentOrders.map((order) => ({
              ...order,
              total: Number(order.total),
            }))
          : [],
        topProducts,
      },
    });
  } catch (caught) {
    return adminError(caught);
  }
}
