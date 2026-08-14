import { NextResponse } from "next/server";
import { requireAdmin, adminError } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import {
  BUILDER_CATEGORY_DESCRIPTION,
  BUILDER_CATEGORY_NAME,
  BUILDER_CATEGORY_SLUG,
  BUILDER_TAG,
  STARTER_BUILDER_ITEMS,
  builderSlugify,
} from "@/lib/builder";

// One-click provisioning of the fallback starter items
// (teddy, chocolate, pen, clutcher, scrunchy) as real, purchasable products.
// Idempotent: re-running upserts by a deterministic slug.
export async function POST() {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  try {
    const category = await prisma.category.upsert({
      where: { slug: BUILDER_CATEGORY_SLUG },
      update: {},
      create: {
        name: BUILDER_CATEGORY_NAME,
        slug: BUILDER_CATEGORY_SLUG,
        description: BUILDER_CATEGORY_DESCRIPTION,
        active: false,
      },
    });

    for (const item of STARTER_BUILDER_ITEMS) {
      const key = builderSlugify(item.name);
      const slug = `gb-${key}`;
      const tags = item.types.map((type) => BUILDER_TAG[type]);
      await prisma.product.upsert({
        where: { slug },
        update: {
          categoryId: category.id,
          price: item.price,
          occasionTags: tags,
          status: "ACTIVE",
        },
        create: {
          categoryId: category.id,
          name: item.name,
          slug,
          description: item.name,
          sku: `GB-STARTER-${key.toUpperCase().replace(/-/g, "")}`,
          price: item.price,
          images: [],
          occasionTags: tags,
          status: "ACTIVE",
          stock: 9999,
        },
      });
    }

    return NextResponse.json({ data: { seeded: STARTER_BUILDER_ITEMS.length } });
  } catch (caught) {
    return adminError(caught);
  }
}
