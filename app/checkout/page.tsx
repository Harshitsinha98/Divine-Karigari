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
import { StateCitySelect } from "@/components/shop/StateCitySelect";
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
  label: "",
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
  const [savingAddress, setSavingAddress] = useState(false);
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
    rate: number | null;
    estimatedDeliveryDate: string | null;
  } | null>(null);
  const [checkingServiceability, setCheckingServiceability] = useState(false);
  // Buyer (account) contact — email + phone stay constant regardless of address
  const [buyer, setBuyer] = useState<{
    name: string;
    email: string;
    phone: string;
  }>({ name: "", email: "", phone: "" });
  // Gift recipient option
  const [giftToSomeoneElse, setGiftToSomeoneElse] = useState(false);
  const [recipient, setRecipient] = useState({ name: "", phone: "" });
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
  // Load buyer's account contact details (email + phone stay constant)
  useEffect(() => {
    void fetch("/api/account/profile").then(async (response) => {
      if (response.ok) {
        const data = (await response.json()).data;
        if (data)
          setBuyer({
            name: data.name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
          });
      }
    });
  }, []);

  const address = addresses.find((item) => item.id === selectedAddress);
  const baseAddress = address ?? (addingAddress ? newAddress : null);
  // Effective shipping address: recipient name/phone comes from the gift
  // recipient if chosen, otherwise the buyer's own account details.
  const currentAddress = baseAddress
    ? {
        ...baseAddress,
        recipientName: giftToSomeoneElse
          ? recipient.name
          : buyer.name || baseAddress.recipientName,
        phone: giftToSomeoneElse
          ? recipient.phone
          : buyer.phone || baseAddress.phone,
      }
    : null;
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
    currentAddress?.line1 &&
    currentAddress.city &&
    currentAddress.state &&
    currentAddress.postalCode &&
    currentAddress.phone.replace(/\D/g, "").length >= 10 &&
    (giftToSomeoneElse ? recipient.name : buyer.name),
  );

  const continueWithAddress = async () => {
    if (!currentAddress || !canContinue) return;
    setError("");

    if (!addingAddress) {
      setStep(2);
      return;
    }

    setSavingAddress(true);
    try {
      const response = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newAddress.label.trim() || "Delivery address",
          recipientName: currentAddress.recipientName,
          phone: currentAddress.phone,
          line1: currentAddress.line1,
          line2: currentAddress.line2?.trim() || undefined,
          city: currentAddress.city,
          state: currentAddress.state,
          postalCode: currentAddress.postalCode,
          country: currentAddress.country || "India",
          isDefault: addresses.length === 0,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Unable to save this delivery address.");
        return;
      }
      const savedAddress = result.data as Address;
      setAddresses((items) => [savedAddress, ...items]);
      setSelectedAddress(savedAddress.id);
      setAddingAddress(false);
      setNewAddress(emptyAddress);
      setStep(2);
    } catch {
      setError("Unable to save this delivery address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  };
  const startPayment = async () => {
    if (!currentAddress || !cart.length || serviceability?.available === false)
      return;
    setLoading(true);
    setError("");
    let result: {
      error?: string;
      data: {
        key: string;
        amount: number;
        currency: string;
        orderNumber: string;
        razorpayOrderId: string;
        orderId: string;
        customer: Record<string, string>;
      };
    };
    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: address?.id,
          shippingAddress: {
            recipientName: currentAddress.recipientName,
            phone: currentAddress.phone,
            line1: currentAddress.line1,
            line2: currentAddress.line2 || undefined,
            city: currentAddress.city,
            state: currentAddress.state,
            postalCode: currentAddress.postalCode,
            country: currentAddress.country || "India",
          },
          items: cart.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || undefined,
            quantity: item.quantity,
            customization: item.customization || undefined,
          })),
          savePaymentMethod: saveMethod,
          paymentMethodType: methodType,
          paymentMethodLabel: methodLabel || "Razorpay method",
        }),
      });
      result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? "Unable to start payment.");
        setLoading(false);
        return;
      }
    } catch {
      setError(
        "Network error. Please check your connection and try again.",
      );
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
                    <div className="rounded-soft-xl border border-sand-line bg-warm-white p-5 shadow-soft sm:p-6">
                      <h3 className="mb-1 font-display text-xl">
                        New delivery address
                      </h3>
                      <p className="mb-4 text-sm text-muted-ink">
                        We&apos;ll save this address to your profile for faster
                        checkout next time.
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          className="sm:col-span-2"
                          placeholder="Save as (e.g. Home, Office)"
                          value={newAddress.label}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              label: e.target.value,
                            })
                          }
                        />
                        <Input
                          required
                          className="sm:col-span-2"
                          placeholder="House/Flat no., Building, Street"
                          value={newAddress.line1}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              line1: e.target.value,
                            })
                          }
                        />
                        <Input
                          className="sm:col-span-2"
                          placeholder="Landmark (e.g. Near Metro Station, Opposite Park)"
                          value={newAddress.line2}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              line2: e.target.value,
                            })
                          }
                        />
                        {/* Pincode with auto-fill */}
                        <div className="sm:col-span-2">
                          <div className="flex items-stretch overflow-hidden rounded-soft border border-sand-line bg-parchment transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
                            <input
                              required
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="6-digit Pincode"
                              value={newAddress.postalCode}
                              onChange={async (e) => {
                                const val = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 6);
                                setNewAddress({
                                  ...newAddress,
                                  postalCode: val,
                                });
                                // Auto-fill state & city when 6 digits entered
                                if (val.length === 6) {
                                  try {
                                    const res = await fetch(
                                      `/api/pincode/lookup?pincode=${val}`,
                                    );
                                    if (res.ok) {
                                      const { data } = await res.json();
                                      setNewAddress((prev) => ({
                                        ...prev,
                                        postalCode: val,
                                        state: data.state || prev.state,
                                        city: data.city || prev.city,
                                      }));
                                    }
                                  } catch {}
                                }
                              }}
                              className="h-12 flex-1 bg-transparent px-4 text-sm text-ink outline-none placeholder:text-muted-ink/60"
                            />
                            {newAddress.postalCode.length === 6 &&
                              newAddress.state && (
                                <span className="flex items-center gap-1 border-l border-sand-line bg-tulsi/5 px-3 text-xs text-tulsi">
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                  >
                                    <path d="M20 6 9 17l-5-5" />
                                  </svg>
                                  {newAddress.city}, {newAddress.state}
                                </span>
                              )}
                          </div>
                          <p className="mt-1.5 text-xs text-muted-ink/70">
                            City & state will auto-fill when you enter the
                            pincode
                          </p>
                        </div>
                        <StateCitySelect
                          state={newAddress.state}
                          city={newAddress.city}
                          onStateChange={(state) =>
                            setNewAddress({ ...newAddress, state })
                          }
                          onCityChange={(city) =>
                            setNewAddress({ ...newAddress, city })
                          }
                        />
                      </div>
                      <div className="mt-5 flex gap-2">
                        <Button
                          type="button"
                          onClick={() => setAddingAddress(false)}
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Recipient details */}
                <div className="mt-6 rounded-soft-xl border border-sand-line bg-warm-white p-5">
                  <h3 className="font-display text-lg">
                    Who is receiving this?
                  </h3>

                  {/* "Same as me" toggle */}
                  <label className="mt-4 flex items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={!giftToSomeoneElse}
                      onChange={(e) => setGiftToSomeoneElse(!e.target.checked)}
                      className="h-4 w-4 accent-gold"
                    />
                    <span>
                      Deliver to me
                      {buyer.name && (
                        <span className="ml-1 text-muted-ink">
                          ({buyer.name}
                          {buyer.phone ? `, ${buyer.phone}` : ""})
                        </span>
                      )}
                    </span>
                  </label>

                  {giftToSomeoneElse && (
                    <div className="mt-4 rounded-soft border border-gold/20 bg-gold/5 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-gold">
                        Gift recipient
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Input
                          required
                          placeholder="Recipient's full name"
                          value={recipient.name}
                          onChange={(e) =>
                            setRecipient({ ...recipient, name: e.target.value })
                          }
                        />
                        <div className="flex items-stretch overflow-hidden rounded-soft border border-sand-line bg-parchment transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
                          <span className="flex items-center border-r border-sand-line bg-sand-line/20 px-3 text-sm">
                            +91
                          </span>
                          <input
                            required
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="Recipient's mobile"
                            value={recipient.phone.replace(/^\+91/, "")}
                            onChange={(e) =>
                              setRecipient({
                                ...recipient,
                                phone: `+91${e.target.value.replace(/\D/g, "").slice(0, 10)}`,
                              })
                            }
                            className="h-11 flex-1 bg-transparent px-3 text-sm outline-none"
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-ink">
                        Courier updates will be sent to the recipient&apos;s
                        number.
                      </p>
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
                {error && (
                  <p className="mt-4 rounded-soft border border-oxblood/20 bg-oxblood/5 p-3 text-sm text-oxblood">
                    {error}
                  </p>
                )}
                <Button
                  disabled={
                    !canContinue ||
                    savingAddress ||
                    checkingServiceability ||
                    serviceability?.available === false
                  }
                  className="mt-7"
                  onClick={continueWithAddress}
                >
                  {savingAddress
                    ? "Saving delivery address..."
                    : "Continue to review"}{" "}
                  <ChevronRight size={16} />
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
