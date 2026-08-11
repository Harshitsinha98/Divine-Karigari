"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCommerce } from "@/components/commerce/CommerceProvider";
import { AccountCard } from "@/components/account/AccountSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { trackBeginCheckout } from "@/lib/client-analytics";

type Address = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};
const emptyAddress = {
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCommerce();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [addingAddress, setAddingAddress] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveMethod, setSaveMethod] = useState(false);
  const [methodLabel, setMethodLabel] = useState("");
  const [methodType, setMethodType] = useState<"card" | "upi">("card");
  const [serviceability, setServiceability] = useState<{
    available: boolean;
    estimatedDays: number | null;
    courierName: string | null;
    estimatedDeliveryDate: string | null;
  } | null>(null);
  const [checkingServiceability, setCheckingServiceability] = useState(false);
  const checkoutTracked = useRef(false);
  const shipping = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + shipping + tax;
  useEffect(() => {
    if (checkoutTracked.current || !cart.length) return;
    checkoutTracked.current = true;
    trackBeginCheckout(cart, total);
  }, [cart, total]);
  useEffect(() => {
    void fetch("/api/account/addresses").then(async (response) => {
      if (response.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }
      if (response.ok) {
        const data = (await response.json()).data as Address[];
        setAddresses(data);
        const preferred = data.find((item) => item.isDefault) ?? data[0];
        if (preferred) setSelectedAddress(preferred.id);
      }
    });
  }, [router]);
  const address = addresses.find((item) => item.id === selectedAddress);
  const currentAddress = address ?? (addingAddress ? newAddress : null);
  const deliveryPincode = currentAddress?.postalCode;
  useEffect(() => {
    if (!deliveryPincode || deliveryPincode.length < 3 || !cart.length) {
      setServiceability(null);
      return;
    }
    setCheckingServiceability(true);
    void fetch("/api/shipping/serviceability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pincode: deliveryPincode,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    })
      .then(async (response) => {
        if (response.ok) setServiceability((await response.json()).data);
        else setServiceability(null);
      })
      .finally(() => setCheckingServiceability(false));
  }, [deliveryPincode, cart]);
  const canContinue = Boolean(
    currentAddress?.recipientName &&
    currentAddress.phone &&
    currentAddress.line1 &&
    currentAddress.city &&
    currentAddress.state &&
    currentAddress.postalCode,
  );
  const startPayment = async () => {
    if (!currentAddress || !cart.length || serviceability?.available === false)
      return;
    setLoading(true);
    setError("");
    const response = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId: address?.id,
        shippingAddress: currentAddress,
        items: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          customization: item.customization,
        })),
        savePaymentMethod: saveMethod,
        paymentMethodType: methodType,
        paymentMethodLabel: methodLabel || "Razorpay method",
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to start payment.");
      setLoading(false);
      return;
    }
    if (!window.Razorpay) {
      setError("Payment checkout is still loading. Please try again.");
      setLoading(false);
      return;
    }
    const razorpay = new window.Razorpay({
      key: result.data.key,
      amount: result.data.amount,
      currency: result.data.currency,
      name: "Divine Karigari",
      description: `Order ${result.data.orderNumber}`,
      order_id: result.data.razorpayOrderId,
      prefill: result.data.customer,
      notes: { orderNumber: result.data.orderNumber },
      theme: { color: "#B8862E" },
      handler: async (payment) => {
        const verify = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: result.data.orderId,
            ...payment,
            savePaymentMethod: saveMethod,
            paymentMethodType: methodType,
            paymentMethodLabel: methodLabel || "Razorpay method",
          }),
        });
        const verified = await verify.json();
        if (!verify.ok) {
          setError(
            verified.error ??
              "Payment verification failed. Please contact support.",
          );
          setLoading(false);
          return;
        }
        clearCart();
        router.push(`/checkout/confirmed/${verified.data.orderNumber}`);
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setError(
            "Payment was cancelled. Your order is still safe — you can retry when ready.",
          );
        },
      },
    });
    razorpay.on("payment.failed", () => {
      setLoading(false);
      setError(
        "Payment failed. Nothing was charged. Please retry or use another payment method.",
      );
    });
    razorpay.open();
  };
  if (!cart.length)
    return (
      <main className="container py-24 text-center">
        <h1 className="font-display text-5xl">Your bag is empty.</h1>
        <Link href="/shop" className="mt-6 inline-block text-oxblood">
          Continue shopping →
        </Link>
      </main>
    );
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <main className="container py-12 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              A considered checkout
            </p>
            <h1 className="mt-3 font-display text-5xl sm:text-6xl">
              Almost yours.
            </h1>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-ink">
            <Lock size={14} /> Secure checkout
          </p>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div>
            <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-ink">
              <span className={step >= 1 ? "text-ink" : ""}>01 Address</span>
              <span className="text-sand-line">/</span>
              <span className={step >= 2 ? "text-ink" : ""}>02 Review</span>
              <span className="text-sand-line">/</span>
              <span className={step >= 3 ? "text-ink" : ""}>03 Payment</span>
            </div>
            {step === 1 && (
              <AccountCard>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl">
                    Where should we deliver?
                  </h2>
                  <MapPin className="text-gold" size={20} />
                </div>
                <div className="mt-6 grid gap-3">
                  {addresses.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedAddress(item.id);
                        setAddingAddress(false);
                      }}
                      className={`rounded-soft border p-4 text-left ${selectedAddress === item.id && !addingAddress ? "border-ink bg-ink/5" : "border-sand-line"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {item.label}
                          {item.isDefault && (
                            <small className="ml-2 text-tulsi">Default</small>
                          )}
                        </span>
                        {selectedAddress === item.id && !addingAddress && (
                          <Check className="text-gold" size={17} />
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-ink">
                        {item.recipientName}, {item.line1}, {item.city},{" "}
                        {item.state} {item.postalCode}
                      </p>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setAddingAddress(true);
                      setSelectedAddress("");
                    }}
                    className="rounded-soft border border-dashed border-sand-line p-4 text-left text-sm text-oxblood hover:border-gold"
                  >
                    + Add a new delivery address
                  </button>
                  {addingAddress && (
                    <div className="grid gap-3 rounded-soft border border-sand-line p-4 sm:grid-cols-2">
                      <Input
                        required
                        placeholder="Recipient name"
                        value={newAddress.recipientName}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            recipientName: e.target.value,
                          })
                        }
                      />
                      <Input
                        required
                        placeholder="Phone"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            phone: e.target.value,
                          })
                        }
                      />
                      <Input
                        required
                        className="sm:col-span-2"
                        placeholder="Address line"
                        value={newAddress.line1}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            line1: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Apartment, landmark (optional)"
                        value={newAddress.line2}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            line2: e.target.value,
                          })
                        }
                      />
                      <Input
                        required
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                      />
                      <Input
                        required
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            state: e.target.value,
                          })
                        }
                      />
                      <Input
                        required
                        placeholder="Postal code"
                        value={newAddress.postalCode}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            postalCode: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
                {checkingServiceability && (
                  <p className="mt-4 text-sm text-muted-ink">
                    Checking delivery availability…
                  </p>
                )}
                {serviceability?.available === false && (
                  <p className="mt-4 rounded-soft border border-oxblood/20 bg-oxblood/5 p-3 text-sm text-oxblood">
                    This pincode is not currently serviceable for this order.
                  </p>
                )}
                {serviceability?.available && (
                  <p className="mt-4 rounded-soft border border-tulsi/20 bg-tulsi/5 p-3 text-sm text-tulsi">
                    Delivery available
                    {serviceability.courierName
                      ? ` via ${serviceability.courierName}`
                      : ""}
                    {serviceability.estimatedDays
                      ? ` · estimated in ${serviceability.estimatedDays} working days`
                      : ""}
                    .
                  </p>
                )}
                <Button
                  disabled={
                    !canContinue ||
                    checkingServiceability ||
                    serviceability?.available === false
                  }
                  className="mt-7"
                  onClick={() => setStep(2)}
                >
                  Continue to review <ChevronRight size={16} />
                </Button>
              </AccountCard>
            )}
            {step === 2 && (
              <AccountCard>
                <h2 className="font-display text-2xl">Review your order</h2>
                <div className="mt-6 grid gap-4">
                  {cart.map((item) => (
                    <div
                      key={item.key}
                      className="flex justify-between gap-5 border-b border-sand-line pb-4 text-sm"
                    >
                      <div>
                        <p>
                          {item.name} × {item.quantity}
                        </p>
                        {item.variantLabel && (
                          <p className="mt-1 text-xs text-muted-ink">
                            {item.variantLabel}
                          </p>
                        )}
                        {item.customization && (
                          <p className="mt-1 text-xs text-muted-ink">
                            Engraving: “{item.customization}”
                          </p>
                        )}
                      </div>
                      <span>
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-ink">Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-ink">Discount</span>
                    <span>—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-ink">Shipping</span>
                    <span>{shipping ? `₹${shipping}` : "Free"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-ink">GST (5%)</span>
                    <span>₹{tax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-sand-line pt-4 font-medium">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="mt-7 flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    <ChevronLeft size={16} />
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)}>
                    Continue to payment <ChevronRight size={16} />
                  </Button>
                </div>
              </AccountCard>
            )}
            {step === 3 && (
              <AccountCard>
                <h2 className="font-display text-2xl">Choose payment</h2>
                <p className="mt-3 text-sm leading-7 text-muted-ink">
                  Razorpay securely supports UPI, cards, netbanking, and
                  wallets.
                </p>
                <div className="mt-6 rounded-soft border border-sand-line p-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" checked readOnly />
                    <span className="font-medium">Razorpay Checkout</span>
                  </div>
                  <p className="mt-2 pl-6 text-xs text-muted-ink">
                    You’ll choose your preferred method in the secure Razorpay
                    window.
                  </p>
                </div>
                <label className="mt-5 flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={saveMethod}
                    onChange={(e) => setSaveMethod(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    Save this payment method for faster checkout next time{" "}
                    <small className="block text-muted-ink">
                      Only a safe display label is stored until tokenization is
                      connected.
                    </small>
                  </span>
                </label>
                {saveMethod && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <select
                      value={methodType}
                      onChange={(e) =>
                        setMethodType(e.target.value as "card" | "upi")
                      }
                      className="h-12 rounded-soft border border-sand-line bg-parchment px-3 text-sm"
                    >
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                    </select>
                    <Input
                      placeholder="Label, e.g. HDFC Visa"
                      value={methodLabel}
                      onChange={(e) => setMethodLabel(e.target.value)}
                    />
                  </div>
                )}
                {error && (
                  <p className="mt-5 rounded-soft border border-oxblood/20 bg-oxblood/5 p-4 text-sm text-oxblood">
                    {error}
                  </p>
                )}
                <div className="mt-7 flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStep(2);
                      setError("");
                    }}
                  >
                    <ChevronLeft size={16} />
                    Back
                  </Button>
                  <Button disabled={loading} onClick={startPayment}>
                    {loading ? (
                      "Opening secure payment..."
                    ) : (
                      <>
                        Pay ₹{total.toLocaleString("en-IN")}{" "}
                        <ShieldCheck size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </AccountCard>
            )}
          </div>
          <aside className="h-fit rounded-soft-xl border border-sand-line p-6">
            <h2 className="font-display text-2xl">Order summary</h2>
            <div className="mt-5 grid gap-3 border-b border-sand-line pb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-ink">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-ink">Estimated delivery</span>
                <span>
                  {serviceability?.estimatedDays
                    ? `${serviceability.estimatedDays} working days`
                    : "3–7 working days"}
                </span>
              </div>
            </div>
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-ink">
              <ShieldCheck className="shrink-0 text-tulsi" size={15} /> Payment
              details are handled securely by Razorpay.
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
