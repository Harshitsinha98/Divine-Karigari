import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  sendNewsletterWelcome,
  syncResendNewsletterContact,
} from "@/lib/marketing-email";

const schema = z.object({
  email: z.string().trim().email().max(254),
  source: z.string().trim().max(80).default("website"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  const email = parsed.data.email.toLowerCase();
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, source: parsed.data.source },
      update: {
        active: true,
        source: parsed.data.source,
        consentedAt: new Date(),
        unsubscribedAt: null,
      },
    });
    const provider = await Promise.allSettled([
      syncResendNewsletterContact(email),
      sendNewsletterWelcome(email),
    ]);
    provider.forEach((result) => {
      if (result.status === "rejected")
        console.error("[newsletter-provider]", result.reason);
    });
    return NextResponse.json({ data: { subscribed: true } }, { status: 201 });
  } catch (error) {
    console.error("[newsletter]", error);
    return NextResponse.json(
      { error: "Unable to subscribe right now." },
      { status: 500 },
    );
  }
}
