import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeText } from "@/lib/sanitize";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .transform((value) => sanitizeText(value, 120)),
  email: z.string().trim().email().max(254),
  subject: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .transform((value) => sanitizeText(value, 160)),
  message: z
    .string()
    .trim()
    .min(1)
    .max(3000)
    .transform((value) => sanitizeText(value, 3000)),
});
export async function POST(request: Request) {
  try {
    const submission = contactSchema.parse(await request.json());
    console.info("[contact-submission]", {
      ...submission,
      receivedAt: new Date().toISOString(),
    });
    return NextResponse.json({ data: { received: true } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }
}
