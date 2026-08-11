import { NextResponse } from "next/server";
import { requireAdmin, adminError } from "@/lib/admin-api";
import { productInputSchema } from "@/lib/api-validation";
import { prisma } from "@/lib/prisma";

const productRoles = ["INVENTORY_MANAGER"] as const;

export async function GET(request: Request) {
  const { error } = await requireAdmin(productRoles);
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const categoryId = searchParams.get("categoryId") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const take = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") ?? 20)),
    );
    const where = {
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { sku: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status: status as "DRAFT" | "ACTIVE" | "ARCHIVED" } : {}),
    };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * take,
        take,
      }),
      prisma.product.count({ where }),
    ]);
    return NextResponse.json({
      data: products.map((product) => ({
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice
          ? Number(product.compareAtPrice)
          : null,
        lengthCm: product.lengthCm ? Number(product.lengthCm) : null,
        widthCm: product.widthCm ? Number(product.widthCm) : null,
        heightCm: product.heightCm ? Number(product.heightCm) : null,
        variants: product.variants.map((variant) => ({
          ...variant,
          price: variant.price ? Number(variant.price) : null,
        })),
      })),
      meta: { page, total, pages: Math.max(1, Math.ceil(total / take)) },
    });
  } catch (caught) {
    return adminError(caught);
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin(productRoles);
  if (error) return error;
  try {
    const input = productInputSchema.parse(await request.json());
    const { variants, ...product } = input;
    const created = await prisma.product.create({
      data: { ...product, variants: { create: variants } },
      include: { category: true, variants: true },
    });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (caught) {
    return adminError(caught);
  }
}
