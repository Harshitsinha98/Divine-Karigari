import { NextResponse } from "next/server";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { couponData, couponSchema } from "@/lib/admin-coupon";
import { prisma } from "@/lib/prisma";

type Context = { params: { id: string } };

export async function PUT(request: Request, { params }: Context) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  try {
    const input = couponSchema.parse(await request.json());
    return NextResponse.json({
      data: await prisma.coupon.update({
        where: { id: params.id },
        data: couponData(input),
      }),
    });
  } catch (caught) {
    return adminError(caught);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  try {
    return NextResponse.json({
      data: await prisma.coupon.update({
        where: { id: params.id },
        data: { active: false },
      }),
    });
  } catch (caught) {
    return adminError(caught);
  }
}
