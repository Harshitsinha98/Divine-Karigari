import { NextResponse } from "next/server";
import { requireAdmin, adminError } from "@/lib/admin-api";
import { builderItemInputSchema } from "@/lib/api-validation";
import { prisma } from "@/lib/prisma";
import {
  BUILDER_CATEGORY_DESCRIPTION,
  BUILDER_CATEGORY_NAME,
  BUILDER_CATEGORY_SLUG,
  BUILDER_TAG,
  builderSlugify,
} from "@/lib/builder";

async function ensureBuilderCategory() {
  return prisma.category.upsert({
    where: { slug: BUILDER_CATEGORY_SLUG },
    update: {},
    create: {
      name: BUILDER_CATEGORY_NAME,
      slug: BUILDER_CATEGORY_SLUG,
      description: BUILDER_CATEGORY_DESCRIPTION,
      active: false,
    },
  });
}

function tagsFor(bouquet: boolean, giftbox: boolean) {
  const tags: string[] = [];
  if (bouquet) tags.push(BUILDER_TAG.bouquet);
  if (giftbox) tags.push(BUILDER_TAG.giftbox);
  if (!tags.length) tags.push(BUILDER_TAG.bouquet, BUILDER_TAG.giftbox);
  return tags;
}

export async function GET() {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  try {
    const category = await ensureBuilderCategory();
    const products = await prisma.product.findMany({
      where: { categoryId: category.id, status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "asc" },
    });
    const data = products.map((product) => ({
      id: product.id,
      name: product.name,
      imageUrl: product.images[0] ?? "",
      price: Number(product.price),
      bouquet: product.occasionTags.includes(BUILDER_TAG.bouquet),
      giftbox: product.occasionTags.includes(BUILDER_TAG.giftbox),
      active: product.status === "ACTIVE",
    }));
    return NextResponse.json({ data });
  } catch (caught) {
    return adminError(caught);
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  try {
    const input = builderItemInputSchema.parse(await request.json());
    const category = await ensureBuilderCategory();
    const suffix = Math.random().toString(36).slice(2, 7);
    const slug = `gb-${builderSlugify(input.name)}-${suffix}`;
    const sku = `GB-${suffix.toUpperCase()}-${Date.now().toString().slice(-5)}`;
    const product = await prisma.product.create({
      data: {
        categoryId: category.id,
        name: input.name,
        slug,
        description: input.name,
        sku,
        price: input.price,
        images: input.imageUrl ? [input.imageUrl] : [],
        occasionTags: tagsFor(input.bouquet, input.giftbox),
        status: input.active ? "ACTIVE" : "DRAFT",
        stock: 9999,
      },
    });
    return NextResponse.json({ data: { id: product.id } }, { status: 201 });
  } catch (caught) {
    return adminError(caught);
  }
}
