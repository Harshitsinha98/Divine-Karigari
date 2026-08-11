import { NextResponse } from "next/server";
import { requireAdmin, adminError } from "@/lib/admin-api";
import { categoryInputSchema } from "@/lib/api-validation";
import { prisma } from "@/lib/prisma";

type Context = { params: { id: string } };

export async function PUT(request: Request, { params }: Context) {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  try {
    const input = categoryInputSchema.parse(await request.json());
    if (input.parentId === params.id)
      return NextResponse.json(
        { error: "A category cannot be its own parent." },
        { status: 400 },
      );
    const category = await prisma.category.update({
      where: { id: params.id },
      data: input,
    });
    return NextResponse.json({ data: category });
  } catch (caught) {
    return adminError(caught);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  try {
    const category = await prisma.category.update({
      where: { id: params.id },
      data: { active: false },
    });
    return NextResponse.json({ data: category });
  } catch (caught) {
    return adminError(caught);
  }
}
