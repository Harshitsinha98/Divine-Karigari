import { NextResponse } from "next/server";
import { z } from "zod";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

const schema = z.object({
  name: z
    .string()
    .trim()
    .transform((value) => sanitizeText(value, 120))
    .pipe(z.string().min(2).max(120)),
  email: z.string().email(),
  password: z.string().min(10),
  role: z.enum(["SUPER_ADMIN", "ORDER_MANAGER", "INVENTORY_MANAGER"]),
});

export async function GET() {
  const { error } = await requireAdmin(["SUPER_ADMIN"]);
  if (error) return error;
  return NextResponse.json({
    data: await prisma.staff.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin(["SUPER_ADMIN"]);
  if (error) return error;
  try {
    const input = schema.parse(await request.json());
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        role: "STAFF",
        passwordHash: await hashPassword(input.password),
        staffProfile: { create: { role: input.role } },
      },
      include: { staffProfile: true },
    });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (caught) {
    return adminError(caught);
  }
}
