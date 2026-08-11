import { NextResponse } from "next/server";
import { z } from "zod";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  role: z
    .enum(["SUPER_ADMIN", "ORDER_MANAGER", "INVENTORY_MANAGER"])
    .optional(),
  active: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { admin, error } = await requireAdmin(["SUPER_ADMIN"]);
  if (error) return error;
  try {
    const input = schema.parse(await request.json());
    if (params.id === admin!.staffId && input.active === false)
      return NextResponse.json(
        { error: "You cannot deactivate your own account." },
        { status: 400 },
      );
    return NextResponse.json({
      data: await prisma.staff.update({
        where: { id: params.id },
        data: input,
        include: { user: { select: { name: true, email: true } } },
      }),
    });
  } catch (caught) {
    return adminError(caught);
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const { admin, error } = await requireAdmin(["SUPER_ADMIN"]);
  if (error) return error;
  if (params.id === admin!.staffId)
    return NextResponse.json(
      { error: "You cannot remove your own account." },
      { status: 400 },
    );
  try {
    return NextResponse.json({
      data: await prisma.staff.update({
        where: { id: params.id },
        data: { active: false },
      }),
    });
  } catch (caught) {
    return adminError(caught);
  }
}
