import { NextResponse } from "next/server";
import { z } from "zod";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { createShiprocketReturnForOrder } from "@/lib/shiprocket";
import { sanitizeText } from "@/lib/sanitize";

const schema = z.object({
  action: z.enum(["approve", "reject", "sync"]),
  adminNotes: z
    .string()
    .trim()
    .transform((value) => sanitizeText(value, 1000))
    .pipe(z.string().max(1000))
    .optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { admin, error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  try {
    const input = schema.parse(await request.json());
    const existing = await prisma.returnRequest.findUnique({
      where: { id: params.id },
    });
    if (!existing)
      return NextResponse.json(
        { error: "Return request not found" },
        { status: 404 },
      );
    if (input.action === "reject") {
      return NextResponse.json({
        data: await prisma.returnRequest.update({
          where: { id: params.id },
          data: {
            status: "REJECTED",
            adminNotes: input.adminNotes,
            reviewedAt: new Date(),
            reviewedById: admin!.staffId,
          },
        }),
      });
    }
    const approved =
      input.action === "approve"
        ? await prisma.returnRequest.update({
            where: { id: params.id },
            data: {
              status: "APPROVED",
              adminNotes: input.adminNotes,
              reviewedAt: new Date(),
              reviewedById: admin!.staffId,
            },
          })
        : existing;
    try {
      const synced = await createShiprocketReturnForOrder(approved.orderId);
      return NextResponse.json({ data: synced, shiprocketSynced: true });
    } catch (syncError) {
      return NextResponse.json({
        data: approved,
        shiprocketSynced: false,
        warning:
          syncError instanceof Error
            ? syncError.message
            : "Shiprocket return sync failed.",
      });
    }
  } catch (caught) {
    return adminError(caught);
  }
}
