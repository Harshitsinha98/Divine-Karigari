import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .transform((value) => sanitizeText(value, 120)),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9 ()-]{7,20}$/),
  password: z.string().min(10).max(128),
});
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      {
        error:
          "Please enter valid details. Passwords must be at least 10 characters.",
      },
      { status: 400 },
    );
  try {
    const input = parsed.data;
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email.toLowerCase() }, { phone: input.phone }],
      },
    });
    if (existing)
      return NextResponse.json(
        {
          error:
            existing.email === input.email.toLowerCase()
              ? "An account with that email already exists."
              : "An account with that phone number already exists.",
        },
        { status: 409 },
      );
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash: await hashPassword(input.password),
        authProvider: "email",
        emailVerified: true,
        wallet: { create: {} },
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });
    const response = NextResponse.json(
      { data: { id: user.id, name: user.name, email: user.email } },
      { status: 201 },
    );
    await setSessionCookie(response, user);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to create your account right now." },
      { status: 500 },
    );
  }
}
