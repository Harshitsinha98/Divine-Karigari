import { NextResponse } from "next/server";
import { requireAdmin, adminError } from "@/lib/admin-api";
import { builderItemInputSchema } from "@/lib/api-validation";
import { prisma } from "@/lib/prisma";
import { BUILDER_TAG } from "@/lib/builder";

type Context = { params: { id: string } };

function tagsFor(bouquet: boolean, giftbox: boolean) {
  const tags: string[] = [];
  if (bouquet) tags.push(BUILDER_TAG.bouquet);
  if (giftbox) tags.push(BUILDER_TAG.giftbox);
  if (!tags.length) tags.push(BUILDER_TAG.bouquet, BUILDER_TAG.giftbox);
  return tags;
}

export async function PUT(request: Request, { params }: Context) {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  try {
    const input = builderItemInputSchema.parse(await request.json());
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: input.name,
        price: input.price,
        images: input.imageUrl ? [input.imageUrl] : [],
        occasionTags: tagsFor(input.bouquet, input.giftbox),
        status: input.active ? "ACTIVE" : "DRAFT",
      },
    });
    return NextResponse.json({ data: { id: product.id } });
  } catch (caught) {
    return adminError(caught);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { status: "ARCHIVED" },
    });
    return NextResponse.json({ data: { id: product.id } });
  } catch (caught) {
    return adminError(caught);
  }
}
