import { NextResponse } from "next/server";
import { checkShiprocketServiceability } from "@/lib/shiprocket";

// Public, no-auth pincode check with a generic 300g/10x10x5 package.
// Used by the gift builder where no specific product is selected yet.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pincode");

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { error: "Enter a valid 6-digit pincode." },
      { status: 400 },
    );
  }

  try {
    const result = await checkShiprocketServiceability(pincode, [
      {
        product: {
          weightGrams: 300,
          lengthCm: 10,
          widthCm: 10,
          heightCm: 5,
        },
        quantity: 1,
      },
    ]);

    if (!result) {
      return NextResponse.json({
        data: { available: true, estimatedDays: 5 },
      });
    }

    return NextResponse.json({
      data: {
        available: result.available,
        estimatedDays: result.estimatedDays,
      },
    });
  } catch {
    // Fallback if Shiprocket is unreachable — assume available
    return NextResponse.json({
      data: { available: true, estimatedDays: 5 },
    });
  }
}
