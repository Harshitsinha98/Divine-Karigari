import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/lib/marketing-email";

function authorized(request: Request) {
  const configured = process.env.CRON_SECRET;
  if (!configured) return process.env.NODE_ENV !== "production";
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return (
    configured.length === provided.length &&
    timingSafeEqual(Buffer.from(configured), Buffer.from(provided))
  );
}

export async function GET(request: Request) {
  if (!authorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hours = Math.max(
    1,
    Number(process.env.ABANDONED_CART_DELAY_HOURS ?? 6),
  );
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const carts = await prisma.cart.findMany({
    where: {
      updatedAt: { lte: cutoff },
      abandonedReminderSentAt: null,
      items: { some: {} },
      user: { role: "CUSTOMER" },
    },
    include: {
      user: {
        select: { email: true, name: true, notificationPreferences: true },
      },
      items: {
        include: {
          product: { select: { name: true, price: true } },
          variant: { select: { price: true } },
        },
      },
    },
    take: 100,
  });
  let sent = 0;
  for (const cart of carts) {
    try {
      const preferences = cart.user.notificationPreferences as {
        giftingNotes?: boolean;
      };
      if (preferences.giftingNotes !== true) continue;
      const result = await sendAbandonedCartEmail({
        email: cart.user.email,
        name: cart.user.name,
        items: cart.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.variant?.price ?? item.product.price),
        })),
      });
      if (result.sent) {
        await prisma.cart.update({
          where: { id: cart.id },
          data: { abandonedReminderSentAt: new Date() },
        });
        sent += 1;
      }
    } catch (error) {
      console.error("[abandoned-cart]", cart.id, error);
    }
  }
  return NextResponse.json({ data: { eligible: carts.length, sent } });
}
