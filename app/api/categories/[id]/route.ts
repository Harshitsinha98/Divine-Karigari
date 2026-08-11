import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAdminApiKey } from "@/lib/api-auth";
import { categoryInputSchema } from "@/lib/api-validation";

type Context = { params: { id: string } };

export async function GET(_: Request, { params }: Context) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        products: { where: { status: "ACTIVE" }, include: { variants: true } },
      },
    });
    if (!category)
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    return NextResponse.json({ data: category });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  const unauthorized = requireAdminApiKey(request);
  if (unauthorized) return unauthorized;
  try {
    return NextResponse.json({
      data: await prisma.category.update({
        where: { id: params.id },
        data: categoryInputSchema.parse(await request.json()),
      }),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const unauthorized = requireAdminApiKey(request);
  if (unauthorized) return unauthorized;
  try {
    return NextResponse.json({
      data: await prisma.category.update({
        where: { id: params.id },
        data: { active: false },
      }),
    });
  } catch (error) {
    return apiError(error);
  }
}
