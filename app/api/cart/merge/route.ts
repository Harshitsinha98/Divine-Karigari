import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { getApiUserId } from "@/lib/user-context";

const mergeSchema = z.object({
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

export async function POST(request: Request) {
  const userId = await getApiUserId();
  if (!userId)
    return NextResponse.json({ error: "User required" }, { status: 401 });
  const parsed = mergeSchema.safeParse(await request.json().catch(() => null));
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
    for (const item of items) {
      const existing = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: item.productId,
          variantId: item.variantId ?? null,
          customization: item.customization ?? null,
        },
      });
      if (existing)
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: Math.min(99, existing.quantity + item.quantity) },
        });
      else
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            customization: item.customization,
          },
        });
    }
    await prisma.cart.update({
      where: { id: cart.id },
      data: { abandonedReminderSentAt: null },
    });
    const result = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });
    return NextResponse.json({
      data:
        result?.items.map((item) => ({
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
              [item.variant.size, item.variant.color]
                .filter(Boolean)
                .join(" · "))
            : undefined,
          customization: item.customization ?? undefined,
        })) ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to merge cart" },
      { status: 500 },
    );
  }
}
