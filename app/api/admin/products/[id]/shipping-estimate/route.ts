import { NextResponse } from "next/server";
import { requireAdmin, adminError } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { checkShiprocketServiceability } from "@/lib/shiprocket";

type Context = { params: { id: string } };

// Admin-only endpoint: given a product ID, fetch estimated shipping cost from
// Shiprocket for a standard delivery pincode (the store's test pincode, or a
// configurable default pincode, defaulting to Delhi 110001).
export async function GET(_: Request, { params }: Context) {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const testPincode =
      process.env.SHIPROCKET_TEST_DELIVERY_PINCODE ?? "110001";
    const result = await checkShiprocketServiceability(testPincode, [
      {
        product: {
          weightGrams: product.weightGrams,
          lengthCm: product.lengthCm,
          widthCm: product.widthCm,
          heightCm: product.heightCm,
        },
        quantity: 1,
      },
    ]);

    if (!result) {
      return NextResponse.json({
        data: { available: false, reason: "Shiprocket not configured." },
      });
    }

    // Compute volumetric weight for display
    const length = product.lengthCm ? Number(product.lengthCm) : 10;
    const width = product.widthCm ? Number(product.widthCm) : 10;
    const height = product.heightCm ? Number(product.heightCm) : 5;
    const volumetricKg = (length * width * height) / 5000;
    const actualKg = (product.weightGrams ?? 300) / 1000;
    const chargeableKg = Math.max(volumetricKg, actualKg);

    return NextResponse.json({
      data: {
        testPincode,
        ...result,
        volumetricKg: Math.round(volumetricKg * 1000) / 1000,
        actualKg: Math.round(actualKg * 1000) / 1000,
        chargeableKg: Math.round(chargeableKg * 1000) / 1000,
      },
    });
  } catch (caught) {
    return adminError(caught);
  }
}
