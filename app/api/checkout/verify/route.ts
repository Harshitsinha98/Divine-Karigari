import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/order-email";
import {
  createShiprocketOrderForOrder,
  resyncShiprocketOrder,
} from "@/lib/shiprocket";

const schema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  savePaymentMethod: z.boolean().default(false),
  paymentMethodType: z.enum(["card", "upi"]).optional(),
  paymentMethodLabel: z.string().optional(),
  paymentMethodLast4: z.string().max(4).optional(),
});
function validSignature(orderId: string, paymentId: string, signature: string) {
  const digest = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return (
    digest.length === signature.length &&
    timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  );
}
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Payment verification details are incomplete." },
      { status: 400 },
    );
  const input = parsed.data;
  if (
    !validSignature(
      input.razorpay_order_id,
      input.razorpay_payment_id,
      input.razorpay_signature,
    )
  )
    return NextResponse.json(
      {
        error:
          "Payment verification failed. Your card or UPI account was not charged by Divine Karigari.",
      },
      { status: 400 },
    );
  const payment = await prisma.payment.findFirst({
    where: {
      orderId: input.orderId,
      providerOrderId: input.razorpay_order_id,
      userId: session.id,
    },
  });
  if (!payment)
    return NextResponse.json(
      { error: "Payment order not found." },
      { status: 404 },
    );
  if (payment.status === "PAID") {
    const existing = await prisma.order.findUnique({
      where: { id: payment.orderId },
      select: { id: true, orderNumber: true },
    });
    if (existing) {
      try {
        await resyncShiprocketOrder(existing.id);
      } catch (error) {
        console.error("[checkout] Shiprocket paid-order retry failed:", error);
      }
    }
    return NextResponse.json({ data: { orderNumber: existing?.orderNumber } });
  }
  const order = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        providerPaymentId: input.razorpay_payment_id,
        providerSignature: input.razorpay_signature,
      },
    });
    const updatedOrder = await tx.order.update({
      where: { id: input.orderId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        trackingEvents: {
          create: {
            status: "CONFIRMED",
            title: "Order confirmed",
            description: "Your payment has been verified.",
          },
        },
      },
      include: { user: true },
    });
    if (updatedOrder.couponId) {
      await tx.couponRedemption.create({
        data: {
          couponId: updatedOrder.couponId,
          userId: session.id,
          orderId: updatedOrder.id,
        },
      });
      await tx.coupon.update({
        where: { id: updatedOrder.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }
    const cart = await tx.cart.findUnique({ where: { userId: session.id } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { abandonedReminderSentAt: null },
      });
    }
    if (
      input.savePaymentMethod &&
      input.paymentMethodType &&
      input.paymentMethodLabel
    )
      await tx.savedPaymentMethod.create({
        data: {
          userId: session.id,
          type: input.paymentMethodType,
          label: input.paymentMethodLabel,
          last4: input.paymentMethodLast4,
        },
      });
    return updatedOrder;
  });
  const notificationPreferences = order.user.notificationPreferences as {
    mobileUpdates?: boolean;
  };
  const emailDelivery = sendOrderConfirmationEmail({
    email: order.user.email,
    name: order.user.name,
    phone:
      notificationPreferences.mobileUpdates === true ? order.user.phone : null,
    orderNumber: order.orderNumber,
    total: Number(order.total),
  }).catch((error) => {
    console.error("[checkout] Order confirmation email failed:", error);
  });
  await createShiprocketOrderForOrder(order.id);
  await emailDelivery;
  return NextResponse.json({ data: { orderNumber: order.orderNumber } });
}
