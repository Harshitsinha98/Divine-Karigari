"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  return submitted ? (
    <p className={dark ? "text-sm text-parchment/70" : "text-sm text-tulsi"}>
      Thank you — you’re on the list.
    </p>
  ) : (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
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
      }}
      className="max-w-md"
    >
      <div className="flex gap-2">
        <Input
          required
          type="email"
          aria-label="Email address"
          placeholder="Your email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={
            dark
              ? "border-parchment/20 bg-parchment/10 text-parchment placeholder:text-parchment/45"
              : "bg-parchment"
          }
        />
        <Button type="submit" variant="secondary" aria-label="Subscribe">
          <ArrowUpRight size={17} />
        </Button>
      </div>
      {error && (
        <p
          className={
            dark ? "mt-2 text-xs text-parchment" : "mt-2 text-xs text-oxblood"
          }
        >
          {error}
        </p>
      )}
    </form>
  );
}
