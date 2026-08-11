"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { fadeInUp } from "@/lib/motion";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tulsi/10">
          <Check size={16} className="text-tulsi" />
        </span>
        <p className={dark ? "text-sm text-parchment/80" : "text-sm text-tulsi"}>
          Thank you — you&apos;re on the list.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      variants={fadeInUp}
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
          const response = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, source: "website" }),
          });
          const payload = await response.json();
          if (!response.ok) {
            setError(payload.error ?? "Unable to subscribe right now.");
            return;
          }
          setSubmitted(true);
        } finally {
          setLoading(false);
        }
      }}
      className="max-w-md"
    >
      <div
        className={`flex items-center gap-2 rounded-full border p-1.5 transition-all duration-300 focus-within:shadow-glow ${
          dark
            ? "border-parchment/20 bg-parchment/5 focus-within:border-gold/40"
            : "border-sand-line bg-white/80 backdrop-blur-sm focus-within:border-gold/50"
        }`}
      >
        <Sparkles
          size={16}
          className={`ml-3 ${dark ? "text-gold/60" : "text-gold/50"}`}
        />
        <input
          required
          type="email"
          aria-label="Email address"
          placeholder="Your email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-sm ${
            dark
              ? "text-parchment placeholder:text-parchment/40"
              : "text-ink placeholder:text-muted-ink/60"
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Subscribe"
          className="group flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-parchment shadow-soft transition-all duration-300 hover:shadow-glow disabled:opacity-50"
        >
          <ArrowRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </button>
      </div>
      {error && (
        <p
          className={`mt-3 text-xs ${dark ? "text-parchment/80" : "text-oxblood"}`}
        >
          {error}
        </p>
      )}
    </motion.form>
  );
}
