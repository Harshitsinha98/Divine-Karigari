import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAdminApiKey } from "@/lib/api-auth";
import { categoryInputSchema } from "@/lib/api-validation";

export async function GET() {
  try {
    return NextResponse.json({
      data: await prisma.category.findMany({
        where: { active: true },
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      }),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  const unauthorized = requireAdminApiKey(request);
  if (unauthorized) return unauthorized;
  try {
    return NextResponse.json(
      {
        data: await prisma.category.create({
          data: categoryInputSchema.parse(await request.json()),
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
