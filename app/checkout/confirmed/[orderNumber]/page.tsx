import Link from "next/link";
import { Check } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { PurchaseTracker } from "@/components/analytics/PurchaseTracker";
import { ThermalReceipt } from "@/components/checkout/ThermalReceipt";
import { Button } from "@/components/ui/Button";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function ConfirmedPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const order = await prisma.order.findFirst({
    where: { orderNumber: params.orderNumber, userId: session.id },
    include: { items: { include: { variant: true } } },
  });
  if (!order) notFound();
  if (order.status === "CANCELLED") redirect(`/account/orders/${order.id}`);
  if (order.paymentStatus !== "PAID") redirect("/account/orders");

  return (
    <main className="container flex min-h-[680px] items-center justify-center py-16">
      <PurchaseTracker
        orderNumber={order.orderNumber}
        total={Number(order.total)}
        tax={Number(order.tax)}
        shipping={Number(order.shippingFee)}
        discount={Number(order.discount)}
        items={order.items.map((item) => ({
          productId: item.productId,
          name: item.productName,
          price: Number(item.unitPrice),
          quantity: item.quantity,
          variantLabel:
            item.variant?.name ??
            [item.variant?.size, item.variant?.color]
              .filter(Boolean)
              .join(" · ") ??
            null,
        }))}
      />
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-tulsi text-parchment">
          <Check size={36} />
        </div>
        <p className="mt-8 text-xs uppercase tracking-[0.22em] text-gold">
          Order confirmed
        </p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">
          Thank you for gifting with feeling.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-ink">
          Your order <strong className="text-ink">{order.orderNumber}</strong>{" "}
          is confirmed. We’ll send tracking details when it begins its journey.
        </p>
        <ThermalReceipt
          orderNumber={order.orderNumber}
          createdAt={order.createdAt.toISOString()}
          paymentStatus={order.paymentStatus}
          currency={order.currency}
          subtotal={Number(order.subtotal)}
          discount={Number(order.discount)}
          shippingFee={Number(order.shippingFee)}
          tax={Number(order.tax)}
          total={Number(order.total)}
          items={order.items.map((item) => ({
            id: item.id,
            productName: item.productName,
            sku: item.sku,
            unitPrice: Number(item.unitPrice),
            quantity: item.quantity,
            customization: item.customization,
            variantLabel:
              (item.variant?.name ??
                [item.variant?.size, item.variant?.color]
                  .filter(Boolean)
                  .join(" · ")) ||
              null,
          }))}
        />
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/account/orders">
            <Button variant="outline">View order</Button>
          </Link>
          <Link href="/shop">
            <Button>Continue shopping</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
