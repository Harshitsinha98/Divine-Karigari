import { NextResponse } from "next/server";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const orderRoles = ["ORDER_MANAGER"] as const;

export async function GET(request: Request) {
  const { error } = await requireAdmin(orderRoles);
  if (error) return error;
  try {
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const take = Math.min(100, Math.max(1, Number(params.get("limit") ?? 25)));
    const q = params.get("q")?.trim();
    const status = params.get("status") as OrderStatus | null;
    const paymentStatus = params.get("paymentStatus") as PaymentStatus | null;
    const from = params.get("from");
    const to = params.get("to");
    const where = {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" as const } },
              {
                user: {
                  is: { email: { contains: q, mode: "insensitive" as const } },
                },
              },
              {
                user: {
                  is: { name: { contains: q, mode: "insensitive" as const } },
                },
              },
            ],
          }
        : {}),
    };
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * take,
        take,
      }),
      prisma.order.count({ where }),
    ]);
    return NextResponse.json({
      data: orders.map((order) => ({ ...order, total: Number(order.total) })),
      meta: { page, total, pages: Math.max(1, Math.ceil(total / take)) },
    });
  } catch (caught) {
    return adminError(caught);
  }
}
