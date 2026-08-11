import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkShiprocketServiceability } from "@/lib/shiprocket";

const schema = z.object({
  pincode: z.string().min(3).max(12),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid delivery pincode." },
      { status: 400 },
    );
  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.items.map((item) => item.productId) } },
    select: {
      id: true,
      weightGrams: true,
      lengthCm: true,
      widthCm: true,
      heightCm: true,
    },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));
  const items = parsed.data.items.map((item) => ({
    product: productMap.get(item.productId),
    quantity: item.quantity,
  }));
  if (items.some((item) => !item.product))
    return NextResponse.json(
      { error: "A product in your bag is unavailable." },
      { status: 400 },
    );
  try {
    const result = await checkShiprocketServiceability(
      parsed.data.pincode,
      items as {
        product: {
          weightGrams: number | null;
          lengthCm: unknown;
          widthCm: unknown;
          heightCm: unknown;
        };
        quantity: number;
      }[],
    );
    return NextResponse.json({
      data: result ?? {
        available: true,
        estimatedDays: 5,
        courierName: null,
        estimatedDeliveryDate: null,
        unconfigured: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to check pincode serviceability.",
      },
      { status: 502 },
    );
  }
}
