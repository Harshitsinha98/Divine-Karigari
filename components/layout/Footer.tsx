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
              href="https://www.instagram.com/divinekarigari"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="group rounded-full border border-parchment/15 bg-parchment/5 p-2.5 transition-all duration-300 hover:border-gold/50 hover:bg-gold/10 hover:shadow-glow"
            >
              <Instagram size={17} className="transition-colors group-hover:text-gold" />
            </a>
            <a
              href="https://www.facebook.com/divinekarigari"
              target="_blank"
              rel="noopener noreferrer"
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
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919653043939"}?text=${encodeURIComponent("Hi! I'm interested in bulk/corporate gifting options for Divine Karigari.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-[#25D366] transition-colors hover:text-[#128C7E]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Bulk &amp; Corporate Orders
            </a>
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
        <span>&copy; {new Date().getFullYear()} Divine Karigari &middot; Crafted in India</span>
        <span className="flex items-center gap-2">
          <Mail size={13} />
          Secure payments &middot; UPI &middot; Cards &middot; Netbanking
        </span>
      </div>

      {/* Credit */}
      <div className="border-t border-parchment/5 py-4 text-center text-[11px] text-parchment/35">
        <span className="inline-flex items-center gap-1.5">
          Made with{" "}
          <span className="inline-block animate-pulse text-[#E11D74]">&hearts;</span>{" "}
          by{" "}
          <a
            href="https://www.codeskate.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-parchment/60 underline decoration-parchment/20 transition hover:text-gold hover:decoration-gold"
          >
            Codeskate Technologies
          </a>
          <span className="text-parchment/25">|</span>
          <a
            href="https://www.codeskate.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-parchment/50 transition hover:text-gold"
          >
            Want a website like this? Visit codeskate.com
          </a>
        </span>
      </div>
    </footer>
  );
}
