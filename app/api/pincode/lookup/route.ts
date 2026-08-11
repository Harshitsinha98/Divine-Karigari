import { NextResponse } from "next/server";

/**
 * Public pincode lookup using India Post API.
 * Returns city, state, and district for a given 6-digit pincode.
 * No API key needed — free and reliable.
 */
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
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { next: { revalidate: 86400 } }, // Cache for 24h
    );
    const data = await response.json();

    if (
      !data?.[0] ||
      data[0].Status !== "Success" ||
      !data[0].PostOffice?.length
    ) {
      return NextResponse.json(
        { error: "Pincode not found." },
        { status: 404 },
      );
    }

    const postOffice = data[0].PostOffice[0];
    return NextResponse.json({
      data: {
        pincode,
        city: postOffice.District ?? postOffice.Division ?? "",
        state: postOffice.State ?? "",
        district: postOffice.District ?? "",
        region: postOffice.Region ?? "",
        areas: data[0].PostOffice.map(
          (po: { Name: string }) => po.Name,
        ).slice(0, 10),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to lookup pincode." },
      { status: 502 },
    );
  }
}
