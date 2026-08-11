import { NextResponse } from "next/server";
import { z } from "zod";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

const schema = z.object({
  action: z.enum(["approve", "reject", "reply"]),
  reply: z
    .string()
    .trim()
    .transform((value) => sanitizeText(value, 1000))
    .pipe(z.string().min(2).max(1000))
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
    if (input.action === "reply" && !input.reply)
      return NextResponse.json(
        { error: "Enter a reply before saving." },
        { status: 400 },
      );
    const now = new Date();
    const data =
      input.action === "approve"
        ? {
            approved: true,
            rejectedAt: null,
            moderatedAt: now,
            moderatedById: admin!.staffId,
          }
        : input.action === "reject"
          ? {
              approved: false,
              rejectedAt: now,
              moderatedAt: now,
              moderatedById: admin!.staffId,
            }
          : {
              adminReply: input.reply,
              repliedAt: now,
              moderatedById: admin!.staffId,
            };
    return NextResponse.json({
      data: await prisma.review.update({ where: { id: params.id }, data }),
    });
  } catch (caught) {
    return adminError(caught);
  }
}
