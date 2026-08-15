import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/order-email";
import {
  createShiprocketOrderForOrder,
  resyncShiprocketOrder,
} from "@/lib/shiprocket";
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  if (
    !secret ||
    digest.length !== signature.length ||
    !timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  )
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  try {
    const payload = JSON.parse(body);
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    if (!orderId || !["payment.captured", "order.paid"].includes(payload.event))
      return NextResponse.json({ received: true });
    const payment = await prisma.payment.findFirst({
      where: { providerOrderId: orderId },
    });
    if (!payment) return NextResponse.json({ received: true });
    if (payment.status === "PAID") {
      try {
        await resyncShiprocketOrder(payment.orderId);
      } catch (error) {
        console.error(
          "[razorpay webhook] Shiprocket paid-order retry failed:",
          error,
        );
      }
      return NextResponse.json({ received: true });
    }
    const order = await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          providerPaymentId: paymentEntity.id,
          metadata: payload,
        },
      });
      const cart = await tx.cart.findUnique({
        where: { userId: payment.userId },
      });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.update({
          where: { id: cart.id },
          data: { abandonedReminderSentAt: null },
        });
      }
      const transitioned = await tx.order.updateMany({
        where: {
          id: payment.orderId,
          status: { not: "CANCELLED" },
          OR: [
            { shiprocketSyncError: null },
            {
              shiprocketSyncError: {
                not: "Shiprocket cancellation in progress",
              },
            },
          ],
        },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
        },
      });
      if (!transitioned.count) {
        return tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "PAID" },
          include: { user: true },
        });
      }
      const updatedOrder = await tx.order.findUnique({
        where: { id: payment.orderId },
        include: { user: true },
      });
      if (!updatedOrder) throw new Error("Order not found.");
      await tx.trackingEvent.create({
        data: {
          orderId: updatedOrder.id,
          status: "CONFIRMED",
          title: "Order confirmed",
          description: "Your payment has been verified.",
        },
      });
      if (updatedOrder.couponId) {
        await tx.couponRedemption.create({
          data: {
            couponId: updatedOrder.couponId,
            userId: payment.userId,
            orderId: updatedOrder.id,
          },
        });
        await tx.coupon.update({
          where: { id: updatedOrder.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }
      return updatedOrder;
    });
    if (
      order.status === "CANCELLED" ||
      order.shiprocketSyncError === "Shiprocket cancellation in progress"
    ) {
      return NextResponse.json({ received: true });
    }
    const emailDelivery = sendOrderConfirmationEmail({
      email: order.user.email,
      name: order.user.name,
      phone: order.user.phone,
      orderNumber: order.orderNumber,
      total: Number(order.total),
    }).catch((error) => {
      console.error(
        "[razorpay webhook] Order confirmation email failed:",
        error,
      );
    });
    await createShiprocketOrderForOrder(order.id);
    await emailDelivery;
    return NextResponse.json({ received: true });
  } catch (error) {
    // Log so paid-but-unsynced orders leave a diagnostic trail.
    console.error("[razorpay webhook] Processing failed:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
