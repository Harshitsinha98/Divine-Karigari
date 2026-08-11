import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  const params = new URL(request.url).searchParams;
  const status = params.get("status") ?? "pending";
  const query = params.get("q")?.trim();
  const reviews = await prisma.review.findMany({
    where: {
      ...(status === "approved"
        ? { approved: true }
        : status === "rejected"
          ? { rejectedAt: { not: null } }
          : status === "all"
            ? {}
            : { approved: false, rejectedAt: null }),
      ...(query
        ? {
            OR: [
              { product: { name: { contains: query, mode: "insensitive" } } },
              { user: { name: { contains: query, mode: "insensitive" } } },
              { user: { email: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      product: { select: { id: true, name: true, slug: true, images: true } },
      user: { select: { id: true, name: true, email: true } },
      moderatedBy: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: reviews });
}
