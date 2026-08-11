import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUserId } from "@/lib/user-context";

export async function GET() {
  const userId = await getApiUserId();
  if (!userId)
    return NextResponse.json({ error: "User required" }, { status: 401 });
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: { include: { product: { include: { category: true } } } },
      },
    });
    return NextResponse.json({
      data:
        wishlist?.items.map((item) => ({
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
      { error: "Unable to load wishlist" },
      { status: 500 },
    );
  }
}
