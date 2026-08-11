"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageIntro } from "@/components/pages/PageIntro";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    if (!response.ok) {
      setError("We couldn’t send that just now. Please try again.");
      return;
    }
    setSent(true);
  }
  return (
    <main className="container py-16 sm:py-24">
      <PageIntro
        eyebrow="We’d love to hear from you"
        title="Let’s make gifting feel a little more personal."
      >
        Questions about an order, a custom request, or simply want to say hello?
        Our team will get back to you within two working days.
      </PageIntro>
      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1.25fr] md:gap-20">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">
            Write to us
          </p>
          <a
            href="mailto:hello@divinekarigari.in"
            className="mt-3 block font-display text-2xl hover:text-oxblood"
          >
            hello@divinekarigari.in
          </a>
          <p className="mt-8 text-sm leading-7 text-muted-ink">
            For order support, please include your order number so we can find
            your details quickly.
          </p>
        </div>
        <div className="rounded-soft-xl border border-sand-line p-6 sm:p-8">
          {sent ? (
            <div className="py-10">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">
                Message received
              </p>
              <h2 className="mt-3 font-display text-4xl">
                Thank you for writing.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-ink">
                We’ve logged your note and will be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="name"
                  required
                  placeholder="Your name"
                  aria-label="Your name"
                />
                <Input
                  name="email"
                  required
                  type="email"
                  placeholder="Email address"
                  aria-label="Email address"
                />
              </div>
              <Input
                name="subject"
                required
                placeholder="What can we help with?"
                aria-label="Subject"
              />
              <Textarea
                name="message"
                required
                placeholder="Tell us a little more..."
                aria-label="Message"
              />
              {error && <p className="text-sm text-oxblood">{error}</p>}
              <Button type="submit" className="justify-self-start">
                Send message
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
