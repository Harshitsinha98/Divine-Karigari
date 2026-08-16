import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getRazorpay } from "@/lib/razorpay";
import { checkShiprocketServiceability } from "@/lib/shiprocket";
import { sanitizeText } from "@/lib/sanitize";

const clean = (maximum: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maximum)
    .transform((value) => sanitizeText(value, maximum));
const addressSchema = z.object({
  recipientName: clean(120),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9 ()-]{7,20}$/),
  line1: clean(200),
  line2: z
    .string()
    .trim()
    .max(200)
    .transform((value) => sanitizeText(value, 200))
    .nullish(),
  city: clean(100),
  state: clean(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9 -]{3,12}$/),
  country: clean(80).default("India"),
});
const schema = z.object({
  addressId: z.string().optional(),
  shippingAddress: addressSchema,
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().nullish(),
        quantity: z.number().int().positive(),
        customization: z
          .string()
          .trim()
          .max(200)
          .transform((value) => sanitizeText(value, 200))
          .nullish(),
      }),
    )
    .min(1),
  couponCode: z.string().trim().max(40).optional(),
  savePaymentMethod: z.boolean().default(false),
  paymentMethodLabel: z.string().trim().max(80).optional(),
  paymentMethodType: z.enum(["card", "upi"]).optional(),
  paymentMethodLast4: z.string().max(4).optional(),
});

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session)
    return NextResponse.json(
      { error: "Please sign in before checkout." },
      { status: 401 },
    );
  const razorpay = getRazorpay();
  if (!razorpay)
    return NextResponse.json(
      {
        error:
          "Razorpay is not configured. Add the payment keys to your environment.",
      },
      { status: 503 },
    );
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    console.error(
      "[create-order] Validation failed:",
      JSON.stringify(parsed.error.issues),
    );
    return NextResponse.json(
      { error: "Please complete your delivery details and cart." },
      { status: 400 },
    );
  }
  try {
    const input = parsed.data;
    if (input.addressId) {
      const savedAddress = await prisma.address.findFirst({
        where: { id: input.addressId, userId: session.id },
      });
      if (!savedAddress)
        return NextResponse.json(
          { error: "That delivery address is no longer available." },
          { status: 400 },
        );
    }
    const products = await prisma.product.findMany({
      where: {
        id: { in: input.items.map((item) => item.productId) },
        status: "ACTIVE",
      },
      include: { variants: true },
    });
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );
    const lineItems = input.items.map((item) => {
      const product = productMap.get(item.productId);
      const variant = product?.variants.find(
        (candidate) => candidate.id === item.variantId,
      );
      if (!product || (item.variantId && !variant))
        throw new Error("One of the selected products is no longer available.");
      const unitPrice = Number(variant?.price ?? product.price);
      const stock = variant?.stock ?? product.stock;
      if (stock < item.quantity)
        throw new Error(`${product.name} does not have enough stock.`);
      return { ...item, product, variant, unitPrice };
    });
    // Serviceability check is best-effort — never block an order if
    // Shiprocket is down or auth fails. AWB is assigned after payment
    // and can be retried from the admin panel.
    let serviceability: Awaited<
      ReturnType<typeof checkShiprocketServiceability>
    > = null;
    try {
      serviceability = await checkShiprocketServiceability(
        input.shippingAddress.postalCode,
        lineItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
      );
      if (serviceability && !serviceability.available)
        throw new Error(
          "This pincode is currently not serviceable for the items in your bag.",
        );
    } catch (error) {
      // Only surface a genuine "not serviceable" message; swallow auth/network errors
      if (
        error instanceof Error &&
        error.message.includes("not serviceable")
      ) {
        throw error;
      }
      console.error("[create-order] Serviceability check skipped:", error);
      serviceability = null;
    }
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    let discount = 0;
    const coupon = input.couponCode
      ? await prisma.coupon.findFirst({
          where: { code: input.couponCode.toUpperCase(), active: true },
        })
      : null;
    if (
      coupon &&
      (!coupon.startsAt || coupon.startsAt <= new Date()) &&
      (!coupon.expiresAt || coupon.expiresAt >= new Date()) &&
      (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
      (!coupon.minimumOrder || subtotal >= Number(coupon.minimumOrder))
    )
      discount =
        coupon.discountType.toLowerCase() === "percentage"
          ? Math.min(
              (subtotal * Number(coupon.value)) / 100,
              Number(coupon.maxDiscount ?? subtotal),
            )
          : Math.min(Number(coupon.value), subtotal);
    const taxable = Math.max(0, subtotal - discount);
    const shippingFee = taxable >= 499 ? 0 : 99;
    const tax = Math.round(taxable * 0.05 * 100) / 100;
    const total = Math.round((taxable + shippingFee + tax) * 100) / 100;
    const orderNumber = `DK-${Date.now().toString(36).toUpperCase()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.id,
        addressId: input.addressId,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        shippingAddress: input.shippingAddress,
        billingAddress: input.shippingAddress,
        couponId: coupon?.id,
        estimatedDeliveryDate:
          serviceability?.estimatedDeliveryDate ?? undefined,
        courierName: serviceability?.courierName ?? undefined,
        items: {
          create: lineItems.map((item) => ({
            productId: item.product.id,
            variantId: item.variant?.id,
            productName: item.product.name,
            sku: item.variant?.sku ?? item.product.sku,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            customization: item.customization,
          })),
        },
        payments: {
          create: {
            userId: session.id,
            provider: "RAZORPAY",
            status: "PENDING",
            amount: total,
          },
        },
      },
      include: { payments: true },
    });
    const providerOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: orderNumber,
      notes: { divineOrderId: order.id },
    });
    await prisma.payment.update({
      where: { id: order.payments[0].id },
      data: { providerOrderId: providerOrder.id },
    });
    return NextResponse.json(
      {
        data: {
          orderId: order.id,
          orderNumber,
          razorpayOrderId: providerOrder.id,
          amount: Math.round(total * 100),
          currency: "INR",
          key: process.env.RAZORPAY_KEY_ID,
          customer: {
            name: (
              await prisma.user.findUnique({
                where: { id: session.id },
                select: { name: true, email: true, phone: true },
              })
            )?.name,
            email: session.email,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    // Log so payment-gateway/database faults are diagnosable in production.
    console.error("[create-order] Failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to start checkout.",
      },
      { status: 400 },
    );
  }
}
