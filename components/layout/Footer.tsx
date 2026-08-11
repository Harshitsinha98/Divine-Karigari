import Link from "next/link";
import { Facebook, Instagram, Mail } from "@/components/layout/Icons";
import { NewsletterForm } from "@/components/home/NewsletterForm";
export function Footer() {
  return (
    <footer className="border-t border-sand-line bg-ink text-parchment">
      <div className="container grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
        <div>
          <p className="font-display text-3xl">
            Divine <span className="text-gold">Karigari</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-7 text-parchment/65">
            Thoughtful gifts, made slowly and meaningfully by Indian artisans.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="rounded-full border border-parchment/20 p-2 hover:border-gold"
            >
              <Instagram size={17} />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="rounded-full border border-parchment/20 p-2 hover:border-gold"
            >
              <Facebook size={17} />
            </a>
          </div>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-[0.18em] text-gold">
            Explore
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-parchment/70">
            <Link href="/shop">All gifts</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/about">Our story</Link>
            <Link href="/contact">Contact us</Link>
          </div>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-[0.18em] text-gold">
            Help
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-parchment/70">
            <Link href="/shipping">Shipping & returns</Link>
            <Link href="/faq">FAQs</Link>
            <Link href="/personalization">Personalization</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-[0.18em] text-gold">
            A note from us
          </h2>
          <p className="mt-5 text-sm leading-7 text-parchment/70">
            Occasionally beautiful things arrive in your inbox. Join for first
            looks, stories, and gifting notes.
          </p>
          <div className="mt-5">
            <NewsletterForm dark />
          </div>
        </div>
      </div>
      <div className="container flex flex-col gap-3 border-t border-parchment/10 py-5 text-xs text-parchment/45 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Divine Karigari · Crafted in India</span>
        <span className="flex items-center gap-3">
          <Mail size={14} /> Secure payments · UPI · Cards · Netbanking
        </span>
      </div>
    </footer>
  );
}
