import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  const params = new URL(request.url).searchParams;
  const status = params.get("status");
  const query = params.get("q")?.trim();
  const returns = await prisma.returnRequest.findMany({
    where: {
      ...(status
        ? {
            status: status as
              "REQUESTED" | "APPROVED" | "REJECTED" | "SHIPPED" | "COMPLETED",
          }
        : {}),
      ...(query
        ? {
            OR: [
              {
                order: {
                  orderNumber: {
                    contains: query,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                user: {
                  email: { contains: query, mode: "insensitive" as const },
                },
              },
              {
                user: {
                  name: { contains: query, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          deliveredAt: true,
        },
      },
      reviewedBy: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: returns });
}
