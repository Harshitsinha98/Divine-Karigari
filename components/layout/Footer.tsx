import Link from "next/link";
import { Facebook, Instagram, Mail } from "@/components/layout/Icons";
import { NewsletterForm } from "@/components/home/NewsletterForm";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-sand-line bg-ink text-parchment">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-gradient-radial from-gold/8 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-60 w-60 rounded-full bg-gradient-radial from-tulsi/10 to-transparent blur-3xl" />

      <div className="container relative grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
        {/* Brand */}
        <div>
          <p className="font-display text-3xl">
            Divine <span className="text-gradient-gold">Karigari</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-7 text-parchment/60">
            Thoughtful gifts, made slowly and meaningfully by Indian artisans.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="group rounded-full border border-parchment/15 bg-parchment/5 p-2.5 transition-all duration-300 hover:border-gold/50 hover:bg-gold/10 hover:shadow-glow"
            >
              <Instagram size={17} className="transition-colors group-hover:text-gold" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="group rounded-full border border-parchment/15 bg-parchment/5 p-2.5 transition-all duration-300 hover:border-gold/50 hover:bg-gold/10 hover:shadow-glow"
            >
              <Facebook size={17} className="transition-colors group-hover:text-gold" />
            </a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h2 className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
            <span className="h-px w-4 bg-gold/50" />
            Explore
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-parchment/65">
            <Link href="/shop" className="transition-colors hover:text-gold">All gifts</Link>
            <Link href="/collections" className="transition-colors hover:text-gold">Collections</Link>
            <Link href="/about" className="transition-colors hover:text-gold">Our story</Link>
            <Link href="/contact" className="transition-colors hover:text-gold">Contact us</Link>
          </div>
        </div>

        {/* Help */}
        <div>
          <h2 className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
            <span className="h-px w-4 bg-gold/50" />
            Help
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-parchment/65">
            <Link href="/track" className="transition-colors hover:text-gold">Track order</Link>
            <Link href="/shipping" className="transition-colors hover:text-gold">Shipping & returns</Link>
            <Link href="/faq" className="transition-colors hover:text-gold">FAQs</Link>
            <Link href="/privacy" className="transition-colors hover:text-gold">Privacy</Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h2 className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
            <span className="h-px w-4 bg-gold/50" />
            A note from us
          </h2>
          <p className="mt-5 text-sm leading-7 text-parchment/60">
            Occasionally beautiful things arrive in your inbox. Join for first
            looks, stories, and gifting notes.
          </p>
          <div className="mt-5">
            <NewsletterForm dark />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container relative flex flex-col gap-3 border-t border-parchment/8 py-5 text-xs text-parchment/40 sm:flex-row sm:items-center sm:justify-between">
        <span>&copy; 2026 Divine Karigari &middot; Crafted in India</span>
        <span className="flex items-center gap-2">
          <Mail size={13} />
          Secure payments &middot; UPI &middot; Cards &middot; Netbanking
        </span>
      </div>
    </footer>
  );
}
