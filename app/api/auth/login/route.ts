import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 },
    );
  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (
      !user?.passwordHash ||
      !(await comparePassword(parsed.data.password, user.passwordHash))
    )
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 },
      );
    const response = NextResponse.json({
      data: { id: user.id, name: user.name, email: user.email },
    });
    await setSessionCookie(response, user);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to sign you in right now." },
      { status: 500 },
    );
  }
}
