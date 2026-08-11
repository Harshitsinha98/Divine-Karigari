import { NextResponse } from "next/server";
import { requireAdmin, adminError } from "@/lib/admin-api";
import { productInputSchema } from "@/lib/api-validation";
import { prisma } from "@/lib/prisma";

const productRoles = ["INVENTORY_MANAGER"] as const;
type Context = { params: { id: string } };

export async function GET(_: Request, { params }: Context) {
  const { error } = await requireAdmin(productRoles);
  if (error) return error;
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, variants: true },
  });
  return product
    ? NextResponse.json({ data: product })
    : NextResponse.json({ error: "Product not found" }, { status: 404 });
}

export async function PUT(request: Request, { params }: Context) {
  const { error } = await requireAdmin(productRoles);
  if (error) return error;
  try {
    const input = productInputSchema.parse(await request.json());
    const { variants, ...product } = input;
    const updated = await prisma.$transaction(async (transaction) => {
      await transaction.productVariant.deleteMany({
        where: { productId: params.id },
      });
      return transaction.product.update({
        where: { id: params.id },
        data: { ...product, variants: { create: variants } },
        include: { category: true, variants: true },
      });
    });
    return NextResponse.json({ data: updated });
  } catch (caught) {
    return adminError(caught);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const { error } = await requireAdmin(productRoles);
  if (error) return error;
  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { status: "ARCHIVED" },
    });
    return NextResponse.json({ data: product });
  } catch (caught) {
    return adminError(caught);
  }
}
