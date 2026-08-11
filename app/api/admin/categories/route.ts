import { NextResponse } from "next/server";
import { requireAdmin, adminError } from "@/lib/admin-api";
import { categoryInputSchema } from "@/lib/api-validation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  const categories = await prisma.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: categories });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  try {
    const input = categoryInputSchema.parse(await request.json());
    const category = await prisma.category.create({ data: input });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (caught) {
    return adminError(caught);
  }
}
