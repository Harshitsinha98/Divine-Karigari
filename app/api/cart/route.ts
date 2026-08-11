import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { getApiUserId } from "@/lib/user-context";

const cartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).optional(),
        quantity: z.number().int().min(1).max(99),
        customization: z
          .string()
          .trim()
          .max(200)
          .transform((value) => sanitizeText(value, 200))
          .optional(),
      }),
    )
    .max(100),
});

async function getCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { category: true } }, variant: true },
      },
    },
  });
  return (
    cart?.items.map((item) => ({
      key: `${item.productId}:${item.variantId ?? "default"}:${item.customization ?? ""}`,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      image: item.product.images[0],
      price: Number(item.variant?.price ?? item.product.price),
      quantity: item.quantity,
      stock: item.variant?.stock ?? item.product.stock,
      variantId: item.variantId ?? undefined,
      variantLabel: item.variant
        ? (item.variant.name ??
          [item.variant.size, item.variant.color].filter(Boolean).join(" · "))
        : undefined,
      customization: item.customization ?? undefined,
    })) ?? []
  );
}

export async function GET() {
  const userId = await getApiUserId();
  if (!userId)
    return NextResponse.json({ error: "User required" }, { status: 401 });
  try {
    return NextResponse.json({ data: await getCart(userId) });
  } catch {
    return NextResponse.json({ error: "Unable to load cart" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getApiUserId();
  if (!userId)
    return NextResponse.json({ error: "User required" }, { status: 401 });
  const parsed = cartSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Cart items are invalid." },
      { status: 400 },
    );
  try {
    const { items } = parsed.data;
    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((item) => item.productId) },
        status: "ACTIVE",
      },
      select: { id: true, variants: { select: { id: true } } },
    });
    const productMap = new Map(
      products.map((product) => [
        product.id,
        new Set(product.variants.map((variant) => variant.id)),
      ]),
    );
    const invalid = items.some((item) => {
      const variants = productMap.get(item.productId);
      return (
        !variants || (item.variantId ? !variants.has(item.variantId) : false)
      );
    });
    if (invalid)
      return NextResponse.json(
        { error: "One or more cart items are unavailable." },
        { status: 400 },
      );
    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cartItem.createMany({
      data: items.map((item) => ({
        cartId: cart.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        customization: item.customization,
      })),
    });
    await prisma.cart.update({
      where: { id: cart.id },
      data: { abandonedReminderSentAt: null },
    });
    return NextResponse.json({ data: await getCart(userId) });
  } catch {
    return NextResponse.json({ error: "Unable to save cart" }, { status: 500 });
  }
}
