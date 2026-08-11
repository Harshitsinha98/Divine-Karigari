import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAdminApiKey } from "@/lib/api-auth";
import { productInputSchema } from "@/lib/api-validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") ?? "ACTIVE";
    const products = await prisma.product.findMany({
      where: {
        status: status as "DRAFT" | "ACTIVE" | "ARCHIVED",
        ...(category ? { category: { slug: category } } : {}),
      },
      include: { category: true, variants: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: products });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  const unauthorized = requireAdminApiKey(request);
  if (unauthorized) return unauthorized;
  try {
    const input = productInputSchema.parse(await request.json());
    const { variants, ...product } = input;
    const created = await prisma.product.create({
      data: { ...product, variants: { create: variants } },
      include: { category: true, variants: true },
    });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
