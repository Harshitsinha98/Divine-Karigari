"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Printer, RotateCcw, Scissors } from "lucide-react";
import { useState } from "react";

type ReceiptItem = {
  id: string;
  productName: string;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  customization: string | null;
  variantLabel: string | null;
};

type ThermalReceiptProps = {
  orderNumber: string;
  createdAt: string;
  paymentStatus: string;
  currency: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
};

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function DetailRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${
        emphasize ? "pt-2 text-[15px] font-bold" : "text-xs"
      }`}
    >
      <span className={emphasize ? "text-[#211d18]" : "text-[#645d53]"}>
        {label}
      </span>
      <span className="shrink-0 tabular-nums text-[#211d18]">{value}</span>
    </div>
  );
}

export function ThermalReceipt({
  orderNumber,
  createdAt,
  paymentStatus,
  currency,
  items,
  subtotal,
  discount,
  shippingFee,
  tax,
  total,
}: ThermalReceiptProps) {
  const reduceMotion = useReducedMotion();
  const [printRun, setPrintRun] = useState(0);
  const [isTorn, setIsTorn] = useState(false);
  const paid = paymentStatus === "PAID";
  const orderDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(createdAt));

  const replay = () => {
    setIsTorn(false);
    setPrintRun((current) => current + 1);
  };

  return (
    <section
      className="mx-auto mt-10 max-w-lg text-left"
      aria-label="Order receipt"
    >
      <div className="relative rounded-[2rem] bg-[#26211d] p-3 pt-7 shadow-[0_24px_60px_rgba(43,36,28,0.25)] sm:p-5 sm:pt-8">
        <div className="absolute left-1/2 top-3 h-2 w-36 -translate-x-1/2 rounded-full bg-black/35 shadow-inner" />
        <div className="absolute inset-x-9 top-7 h-5 rounded-t-xl bg-[#15120f]" />
        <div className="relative overflow-hidden rounded-sm bg-[#fffdf7] shadow-[0_12px_18px_rgba(0,0,0,0.35)]">
          <motion.article
            key={printRun}
            initial={
              reduceMotion
                ? false
                : { opacity: 0, clipPath: "inset(0 0 100% 0)" }
            }
            animate={
              isTorn && !reduceMotion
                ? { opacity: 0, y: 30, rotate: -1.5 }
                : reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, clipPath: "inset(0 0 0% 0)" }
            }
            transition={{
              duration: isTorn ? 0.35 : 1.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden bg-[linear-gradient(90deg,rgba(47,42,35,0.018)_1px,transparent_1px),linear-gradient(rgba(47,42,35,0.014)_1px,transparent_1px)] bg-[size:4px_4px] px-5 pb-5 pt-6 font-mono text-[#211d18] sm:px-7 sm:pb-7"
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.45, duration: 0.4 }}
              className="text-center"
            >
              <p className="font-display text-2xl tracking-[0.08em]">DIVINE</p>
              <p className="mt-0.5 text-[10px] font-bold tracking-[0.28em] text-[#8c6524]">
                KARIGARI
              </p>
              <p className="mt-3 text-[9px] tracking-[0.12em] text-[#645d53]">
                HANDCRAFTED GIFTING, MADE MEANINGFUL
              </p>
            </motion.div>

            <div className="my-5 border-t border-dashed border-[#9d978d]" />

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: { staggerChildren: reduceMotion ? 0 : 0.08 },
                },
              }}
              className="space-y-1.5 text-[10px] leading-relaxed"
            >
              {[
                ["ORDER", orderNumber],
                ["DATE", orderDate],
                ["PAYMENT", paid ? "RAZORPAY · PAID" : paymentStatus],
              ].map(([label, value]) => (
                <motion.div
                  key={label}
                  variants={{
                    hidden: { opacity: 0, x: -6 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="flex justify-between gap-4"
                >
                  <span className="text-[#645d53]">{label}</span>
                  <span className="max-w-[64%] text-right font-semibold">
                    {value}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <div className="my-5 border-t border-dashed border-[#9d978d]" />
            <p className="mb-3 text-[10px] font-bold tracking-[0.16em]">
              YOUR ORDER
            </p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    delayChildren: reduceMotion ? 0 : 0.8,
                    staggerChildren: reduceMotion ? 0 : 0.1,
                  },
                },
              }}
              className="space-y-4"
            >
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="flex gap-3 text-xs"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#cfc7b9] text-[10px] font-bold">
                    {item.quantity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-5">{item.productName}</p>
                    {(item.variantLabel || item.customization) && (
                      <p className="mt-0.5 text-[10px] leading-4 text-[#645d53]">
                        {[item.variantLabel, item.customization]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {money(item.unitPrice * item.quantity, currency)}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <div className="my-5 border-t border-dashed border-[#9d978d]" />
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    delayChildren: reduceMotion ? 0 : 1.25,
                    staggerChildren: reduceMotion ? 0 : 0.07,
                  },
                },
              }}
              className="space-y-2"
            >
              <motion.div
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              >
                <DetailRow label="Subtotal" value={money(subtotal, currency)} />
              </motion.div>
              {discount > 0 && (
                <motion.div
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                >
                  <DetailRow
                    label="Gift discount"
                    value={`−${money(discount, currency)}`}
                  />
                </motion.div>
              )}
              <motion.div
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              >
                <DetailRow
                  label="Shipping"
                  value={
                    shippingFee ? money(shippingFee, currency) : "COMPLIMENTARY"
                  }
                />
              </motion.div>
              {tax > 0 && (
                <motion.div
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                >
                  <DetailRow
                    label="GST included"
                    value={money(tax, currency)}
                  />
                </motion.div>
              )}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 5 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="mt-3 border-t border-[#211d18] pt-2">
                  <DetailRow
                    label="TOTAL PAID"
                    value={money(total, currency)}
                    emphasize
                  />
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={
                reduceMotion ? false : { opacity: 0, scale: 0.8, rotate: -8 }
              }
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              transition={{
                delay: reduceMotion ? 0 : 1.65,
                type: "spring",
                stiffness: 220,
                damping: 15,
              }}
              className="mx-auto mt-6 flex w-fit items-center gap-1.5 rounded-sm border-2 border-[#2c643c] px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-[#2c643c]"
            >
              <Check size={13} strokeWidth={3} />{" "}
              {paid ? "PAYMENT RECEIVED" : "PAYMENT PROCESSING"}
            </motion.div>

            <div className="my-5 border-t border-dashed border-[#9d978d]" />
            <div className="text-center text-[9px] leading-4 text-[#645d53]">
              <p>THANK YOU FOR CHOOSING ARTISANAL.</p>
              <p>TRACKING DETAILS WILL FOLLOW SHORTLY.</p>
              <div className="mx-auto mt-4 h-8 w-40 bg-[repeating-linear-gradient(90deg,#211d18_0_2px,transparent_2px_4px,#211d18_4px_5px,transparent_5px_8px)]" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-[radial-gradient(circle_at_7px_0,transparent_7px,#f6eedf_7.5px)] bg-[size:14px_14px]" />
          </motion.article>
        </div>
        <div className="mt-3 flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.16em] text-[#d9c7a8]">
          <span>Thermal print</span>
          <span>Divine Karigari</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={replay}
          className="inline-flex items-center gap-2 rounded-full border border-sand-line bg-parchment px-4 py-2 text-xs font-medium transition hover:border-gold hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
        >
          <RotateCcw size={14} /> Print again
        </button>
        <button
          type="button"
          onClick={() => setIsTorn(true)}
          disabled={isTorn}
          className="inline-flex items-center gap-2 rounded-full border border-sand-line bg-parchment px-4 py-2 text-xs font-medium transition hover:border-gold hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isTorn ? <Printer size={14} /> : <Scissors size={14} />}
          {isTorn ? "Torn" : "Tear receipt"}
        </button>
      </div>
    </section>
  );
}
