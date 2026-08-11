import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkShiprocketServiceability } from "@/lib/shiprocket";

/**
 * PUBLIC pincode delivery estimate for a single product.
 * Used by the "Check delivery" widget on product pages — no auth required.
 * Rate-limiting is applied by middleware (namespace: sensitive-api not needed;
 * this is a low-risk GET-like POST, covered by the general /api limit).
 */
const schema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(50).optional(),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      {
        error:
          parsed.error.errors[0]?.message ?? "Enter a valid 6-digit pincode.",
      },
      { status: 400 },
    );

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: {
      id: true,
      weightGrams: true,
      lengthCm: true,
      widthCm: true,
      heightCm: true,
    },
  });

  if (!product)
    return NextResponse.json(
      { error: "Product not found." },
      { status: 404 },
    );

  try {
    const result = await checkShiprocketServiceability(parsed.data.pincode, [
      {
        product,
        quantity: parsed.data.quantity ?? 1,
      },
    ]);

    // Fallback estimate when Shiprocket is not configured
    return NextResponse.json({
      data: result ?? {
        available: true,
        estimatedDays: 5,
        courierName: null,
        rate: null,
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
            : "Unable to check delivery for this pincode.",
      },
      { status: 502 },
    );
  }
}
