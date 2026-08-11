import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAdminApiKey } from "@/lib/api-auth";
import { productInputSchema } from "@/lib/api-validation";

type Context = { params: { id: string } };

export async function GET(_: Request, { params }: Context) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: true,
        reviews: { where: { approved: true } },
      },
    });
    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ data: product });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  const unauthorized = requireAdminApiKey(request);
  if (unauthorized) return unauthorized;
  try {
    const input = productInputSchema.parse(await request.json());
    const { variants, ...product } = input;
    const updated = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: params.id } });
      return tx.product.update({
        where: { id: params.id },
        data: { ...product, variants: { create: variants } },
        include: { category: true, variants: true },
      });
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const unauthorized = requireAdminApiKey(request);
  if (unauthorized) return unauthorized;
  try {
    await prisma.product.update({
      where: { id: params.id },
      data: { status: "ARCHIVED" },
    });
    return NextResponse.json({ data: { id: params.id, archived: true } });
  } catch (error) {
    return apiError(error);
  }
}
