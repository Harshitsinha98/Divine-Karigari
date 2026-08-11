import { NextResponse } from "next/server";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { couponData, couponSchema } from "@/lib/admin-coupon";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  const query = new URL(request.url).searchParams.get("q")?.trim();
  const coupons = await prisma.coupon.findMany({
    where: query
      ? {
          OR: [
            { code: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { _count: { select: { redemptions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: coupons });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  try {
    const input = couponSchema.parse(await request.json());
    const coupon = await prisma.coupon.create({ data: couponData(input) });
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (caught) {
    return adminError(caught);
  }
}
