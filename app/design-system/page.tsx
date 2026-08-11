"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { Accordion } from "@/components/ui/Accordion";
import { RangoliMotif } from "@/components/ui/RangoliMotif";
import { fadeIn, slideUp, staggerChildren } from "@/lib/motion";
import { motion } from "framer-motion";

const swatches = [
  { name: "Parchment", value: "#F6EEDF", className: "bg-parchment" },
  { name: "Ink", value: "#2B241C", className: "bg-ink" },
  { name: "Temple Gold", value: "#B8862E", className: "bg-gold" },
  { name: "Oxblood", value: "#7A2530", className: "bg-oxblood" },
  { name: "Deep Tulsi", value: "#274B3B", className: "bg-tulsi" },
  { name: "Sand Line", value: "#DFCFAE", className: "bg-sand-line" },
];
export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  return (
    <main className="container py-16 sm:py-24">
      <motion.div initial="hidden" animate="visible" variants={staggerChildren}>
        <motion.p
          variants={fadeIn}
          className="text-xs font-medium uppercase tracking-[0.25em] text-oxblood"
        >
          Divine Karigari · Foundation
        </motion.p>
        <motion.h1
          variants={slideUp}
          className="mt-4 max-w-3xl font-display text-5xl leading-tight sm:text-7xl"
        >
          A quiet language for <em className="text-oxblood">beautiful</em>{" "}
          things.
        </motion.h1>
        <motion.p
          variants={slideUp}
          className="mt-6 max-w-xl leading-7 text-muted-ink"
        >
          A living reference for the visual system, components, and restrained
          interactions we’ll use across the storefront.
        </motion.p>
      </motion.div>
      <section className="mt-20 border-t border-sand-line pt-12">
        <SectionTitle
          eyebrow="01 · Palette"
          title="Colors with a sense of place"
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {swatches.map((color) => (
            <div key={color.name}>
              <div
                className={`h-24 rounded-soft ${color.className} ${color.name === "Parchment" ? "border border-sand-line" : ""}`}
              />
              <p className="mt-3 text-sm font-medium">{color.name}</p>
              <p className="mt-1 font-mono text-xs text-muted-ink">
                {color.value}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-20 border-t border-sand-line pt-12">
        <SectionTitle eyebrow="02 · Type" title="Crafted contrast" />
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-ink">
              Fraunces · Display
            </p>
            <p className="mt-3 font-display text-5xl leading-tight">
              The joy is in the detail.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-ink">
              Inter · Body
            </p>
            <p className="mt-3 max-w-md text-base leading-8">
              Warm, legible, and generous with space. The body type lets the
              objects and stories lead.
            </p>
          </div>
        </div>
        <div className="mt-10 flex items-baseline gap-6">
          <span className="font-display text-4xl">Aa</span>
          <span className="font-display text-3xl">Aa</span>
          <span className="font-display text-2xl">Aa</span>
          <span className="font-display text-xl">Aa</span>
          <span className="text-base">Aa</span>
        </div>
      </section>
      <section className="mt-20 border-t border-sand-line pt-12">
        <SectionTitle
          eyebrow="03 · Components"
          title="Useful, tactile building blocks"
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-display text-2xl">Buttons & status</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button>Primary action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Badge>New arrival</Badge>
              <Badge className="border-tulsi/30 bg-tulsi/10 text-tulsi">
                In stock
              </Badge>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-2xl">Form fields</h3>
            <div className="mt-5 grid gap-3">
              <Input placeholder="Your name" />
              <Textarea placeholder="A note for the maker..." />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-2xl">Elevation & loading</h3>
            <div className="mt-5 flex gap-4">
              <div className="flex h-24 flex-1 items-center justify-center rounded-soft-xl border border-sand-line text-sm shadow-soft">
                Soft shadow
              </div>
              <div className="flex h-24 flex-1 items-center justify-center rounded-soft-xl border border-sand-line text-sm shadow-lift">
                Lift shadow
              </div>
            </div>
            <Skeleton className="mt-5 h-4 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-2xl">Quiet interactions</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setModalOpen(true)}>
                Open modal
              </Button>
              <Button variant="secondary" onClick={() => setToast(true)}>
                Show toast
              </Button>
            </div>
            <div className="mt-6">
              <Accordion
                items={[
                  {
                    title: "Can I personalize a gift?",
                    content:
                      "Yes. Personalization options will be available on eligible product pages.",
                  },
                  {
                    title: "How does shipping work?",
                    content:
                      "We partner with trusted logistics providers to deliver across India.",
                  },
                ]}
              />
            </div>
          </Card>
        </div>
        {toast && (
          <div className="fixed bottom-5 right-5 z-40">
            <Toast
              message="Your preference has been saved."
              onClose={() => setToast(false)}
            />
          </div>
        )}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="A considered detail"
        >
          <p className="text-sm leading-7 text-muted-ink">
            Modal surfaces use a soft veil and a gentle lift, keeping the focus
            on the message.
          </p>
          <div className="mt-6">
            <Button onClick={() => setModalOpen(false)}>Close window</Button>
          </div>
        </Modal>
      </section>
      <section className="mt-20 border-t border-sand-line pt-12">
        <SectionTitle
          eyebrow="04 · Signature motif"
          title="A line that carries the story"
        />
        <div className="relative mt-8 flex min-h-96 items-center justify-center overflow-hidden rounded-soft-xl border border-sand-line bg-parchment/60">
          <RangoliMotif className="absolute h-[460px] w-[460px] text-gold" />
          <div className="relative text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-oxblood">
              One bold moment
            </p>
            <p className="mt-3 font-display text-4xl">Made with intention.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-gold">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl">{title}</h2>
    </div>
  );
}
