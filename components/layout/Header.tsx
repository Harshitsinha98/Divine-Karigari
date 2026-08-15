"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, MapPin, PackageSearch } from "lucide-react";
import {
  Heart,
  Search,
  ShoppingBag,
  UserRound,
  Menu,
  X,
} from "@/components/layout/Icons";
import { useCommerce } from "@/components/commerce/CommerceProvider";

type Suggestion = { name: string; slug: string; category: string };

const categoryNav: [string, string][] = [
  ["Rakhi", "/shop?category=rakhi-festive"],
  ["Personalized", "/shop?category=personalized-gifts"],
  ["Home & Decor", "/shop?category=home-decor"],
  ["Jewelry", "/shop?category=jewelry-accessories"],
];

const giftMenu: { heading: string; items: [string, string][] }[] = [
  {
    heading: "By recipient",
    items: [
      ["Gifts for Her", "/shop?occasion=for-her"],
      ["Gifts for Him", "/shop?occasion=for-him"],
      ["Gifts for Couples", "/shop?occasion=for-couples"],
      ["Gifts for Kids", "/shop?occasion=for-kids"],
    ],
  },
  {
    heading: "By category",
    items: [
      ["Personalized Gifts", "/shop?category=personalized-gifts"],
      ["Home & Decor", "/shop?category=home-decor"],
      ["Jewelry & Accessories", "/shop?category=jewelry-accessories"],
      ["Rakhi & Festive", "/shop?category=rakhi-festive"],
    ],
  },
  {
    heading: "Build your own",
    items: [
      ["Custom Bouquet", "/#gift-builder"],
      ["Custom Gift Box", "/#gift-builder"],
      ["All Gifts", "/shop"],
      ["Collections", "/collections"],
    ],
  },
];

const occasionMenu: [string, string][] = [
  ["Birthdays", "/shop?occasion=birthdays"],
  ["Anniversary", "/shop?occasion=for-couples"],
  ["Weddings", "/shop?occasion=weddings"],
  ["Housewarming", "/shop?occasion=housewarming"],
  ["Festivals & Rakhi", "/shop?occasion=festivals"],
];

function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setSuggestions((await res.json()).data);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 rounded-full border border-sand-line bg-cream px-4 py-2.5 focus-within:border-tulsi">
        <Search size={17} className="shrink-0 text-muted-ink" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder="Search for gifts, flowers, hampers…"
          aria-label="Search"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-ink/70"
        />
      </div>
      {focused && query.trim().length > 1 && (
        <div className="absolute left-0 right-0 top-12 z-50 rounded-soft-xl border border-sand-line bg-white p-2 shadow-lift">
          {suggestions.length ? (
            suggestions.map((s) => (
              <Link
                key={s.slug}
                href={`/shop/${s.slug}`}
                className="block rounded-soft px-3 py-2.5 hover:bg-cream"
              >
                <span className="block text-sm text-ink">{s.name}</span>
                <span className="mt-0.5 block text-xs text-muted-ink">
                  {s.category}
                </span>
              </Link>
            ))
          ) : (
            <p className="px-3 py-4 text-sm text-muted-ink">
              No matching gifts yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { cartCount, setCartOpen } = useCommerce();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-soft">
      {/* ── Utility bar ── */}
      <div className="border-b border-sand-line">
        <div className="container flex h-16 items-center gap-3 sm:gap-5">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt="Divine Karigari"
              width={44}
              height={44}
              className="h-9 w-9 sm:h-10 sm:w-10"
              priority
            />
            <span className="hidden font-display text-lg leading-none tracking-tight text-ink sm:block">
              Divine <span className="text-gradient-gold">Karigari</span>
            </span>
          </Link>

          {/* Deliver-to pill (decorative) */}
          <span className="hidden items-center gap-1.5 rounded-full border border-sand-line bg-cream px-3 py-2 text-xs text-muted-ink lg:inline-flex">
            <MapPin size={14} className="text-tulsi" />
            Deliver across India
          </span>

          {/* Search */}
          <div className="hidden flex-1 md:block">
            <HeaderSearch />
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href="/track"
              className="hidden flex-col items-center px-2 text-[11px] text-muted-ink transition hover:text-tulsi sm:flex"
            >
              <PackageSearch size={19} />
              Track
            </Link>
            <Link
              href="/account"
              className="hidden flex-col items-center px-2 text-[11px] text-muted-ink transition hover:text-tulsi sm:flex"
            >
              <UserRound size={19} />
              Sign in
            </Link>
            <Link
              href="/wishlist"
              className="hidden flex-col items-center px-2 text-[11px] text-muted-ink transition hover:text-oxblood sm:flex"
            >
              <Heart size={19} />
              Wishlist
            </Link>
            <button
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
              className="relative flex flex-col items-center px-2 text-[11px] text-muted-ink transition hover:text-tulsi"
            >
              <ShoppingBag size={19} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-0.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen(!open)}
              className="rounded-full p-2 text-ink md:hidden"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="container pb-3 md:hidden">
          <HeaderSearch />
        </div>
      </div>

      {/* ── Category nav ── */}
      <div className="hidden border-b border-sand-line md:block">
        <nav className="container flex items-center justify-center gap-1">
          {/* Gifts mega-menu */}
          <div className="group relative">
            <button className="flex items-center gap-1 px-3 py-3 text-sm font-medium text-ink transition hover:text-tulsi">
              Gifts
              <ChevronDown
                size={14}
                className="transition-transform duration-200 group-hover:rotate-180"
              />
            </button>
            <div className="pointer-events-none absolute left-1/2 top-full z-50 -translate-x-1/2 pt-1 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="grid w-[600px] grid-cols-3 gap-6 rounded-soft-2xl border border-sand-line bg-white p-6 shadow-lift-lg">
                {giftMenu.map((col) => (
                  <div key={col.heading}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                      {col.heading}
                    </p>
                    <div className="grid gap-2.5">
                      {col.items.map(([label, href]) => (
                        <Link
                          key={label + href}
                          href={href}
                          className="text-sm text-muted-ink transition-colors hover:text-tulsi"
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {categoryNav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-3 text-sm font-medium text-ink transition hover:text-tulsi"
            >
              {label}
            </Link>
          ))}

          {/* Occasions mega-menu */}
          <div className="group relative">
            <button className="flex items-center gap-1 px-3 py-3 text-sm font-medium text-ink transition hover:text-tulsi">
              Occasions
              <ChevronDown
                size={14}
                className="transition-transform duration-200 group-hover:rotate-180"
              />
            </button>
            <div className="pointer-events-none absolute left-1/2 top-full z-50 -translate-x-1/2 pt-1 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="grid w-52 gap-2.5 rounded-soft-2xl border border-sand-line bg-white p-5 shadow-lift-lg">
                {occasionMenu.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="text-sm text-muted-ink transition-colors hover:text-tulsi"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/#gift-builder"
            className="px-3 py-3 text-sm font-medium text-oxblood transition hover:text-gold"
          >
            Custom Bouquet
          </Link>
          <Link
            href="/shop"
            className="px-3 py-3 text-sm font-medium text-ink transition hover:text-tulsi"
          >
            All Gifts
          </Link>
        </nav>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={`absolute inset-x-0 top-full border-b border-sand-line bg-white shadow-lift transition-all duration-300 md:hidden ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav className="container grid gap-1 py-4">
          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            className="rounded-soft-lg px-4 py-3 font-display text-lg hover:bg-cream"
          >
            All Gifts
          </Link>
          {categoryNav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-soft-lg px-4 py-3 font-display text-lg hover:bg-cream"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/#gift-builder"
            onClick={() => setOpen(false)}
            className="rounded-soft-lg px-4 py-3 font-display text-lg text-oxblood hover:bg-cream"
          >
            Custom Bouquet
          </Link>

          <div className="mt-2 border-t border-sand-line pt-3">
            <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Shop by occasion
            </p>
            <div className="grid grid-cols-2 gap-1">
              {occasionMenu.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-soft px-4 py-2.5 text-sm text-muted-ink hover:bg-cream hover:text-tulsi"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-3 flex gap-2 border-t border-sand-line pt-4">
            <Link
              href="/wishlist"
              onClick={() => setOpen(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-soft border border-sand-line py-3 text-sm hover:border-tulsi hover:text-tulsi"
            >
              <Heart size={16} /> Wishlist
            </Link>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-soft border border-sand-line py-3 text-sm hover:border-tulsi hover:text-tulsi"
            >
              <UserRound size={16} /> Sign in
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
