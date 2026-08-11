import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getApiUserId } from "@/lib/user-context";

const schema = z.object({
  items: z.array(z.object({ productId: z.string().min(1) })).max(200),
});

export async function POST(request: Request) {
  const userId = await getApiUserId();
  if (!userId)
    return NextResponse.json({ error: "User required" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Wishlist items are invalid." },
      { status: 400 },
    );
  try {
    const { items } = parsed.data;
    const availableProducts = await prisma.product.count({
      where: {
        id: { in: items.map((item) => item.productId) },
        status: "ACTIVE",
      },
    });
    if (availableProducts !== new Set(items.map((item) => item.productId)).size)
      return NextResponse.json(
        { error: "One or more wishlist items are unavailable." },
        { status: 400 },
      );
    const wishlist = await prisma.wishlist.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    for (const item of items)
      await prisma.wishlistItem.upsert({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId: item.productId,
          },
        },
        update: {},
        create: { wishlistId: wishlist.id, productId: item.productId },
      });
    const result = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: { include: { product: { include: { category: true } } } },
      },
    });
    return NextResponse.json({
      data:
        result?.items.map((item) => ({
          productId: item.productId,
          slug: item.product.slug,
          name: item.product.name,
          image: item.product.images[0],
          price: Number(item.product.price),
          stock: item.product.stock,
          category: item.product.category.name,
        })) ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to merge wishlist" },
      { status: 500 },
    );
  }
}
