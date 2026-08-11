import { NextResponse } from "next/server";
import { z } from "zod";
import { setAdminSessionCookie } from "@/lib/admin-auth";
import { comparePassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 },
    );

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      include: { staffProfile: true },
    });
    if (
      !user?.passwordHash ||
      user.role !== "STAFF" ||
      !user.staffProfile?.active ||
      !(await comparePassword(parsed.data.password, user.passwordHash))
    )
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 },
      );

    const response = NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.staffProfile.role,
      },
    });
    await setAdminSessionCookie(response, {
      id: user.id,
      email: user.email,
      staffId: user.staffProfile.id,
      role: user.staffProfile.role,
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 },
    );
  }
}
