import Link from "next/link";
import { Check, PackageCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AccountCard } from "@/components/account/AccountSection";
import { PurchaseTracker } from "@/components/analytics/PurchaseTracker";
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
        <AccountCard className="mx-auto mt-10 max-w-lg text-left">
          <div className="flex items-center gap-3 border-b border-sand-line pb-4">
            <PackageCheck className="text-gold" size={20} />
            <div>
              <p className="font-medium">Estimated delivery</p>
              <p className="text-sm text-muted-ink">3–7 working days</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4">
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span>
                  ₹
                  {(Number(item.unitPrice) * item.quantity).toLocaleString(
                    "en-IN",
                  )}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-sand-line pt-4 font-medium">
              <span>Total paid</span>
              <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </AccountCard>
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
