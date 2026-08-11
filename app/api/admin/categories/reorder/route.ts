import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, adminError } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int().nonnegative(),
      parentId: z.string().nullable().optional(),
    }),
  ),
});

export async function PUT(request: Request) {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  try {
    const { items } = reorderSchema.parse(await request.json());
    await prisma.$transaction(
      items.map((item) =>
        prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder, parentId: item.parentId },
        }),
      ),
    );
    return NextResponse.json({ data: { updated: items.length } });
  } catch (caught) {
    return adminError(caught);
  }
}
