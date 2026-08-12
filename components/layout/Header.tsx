"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  UserRound,
  Menu,
  X,
} from "@/components/layout/Icons";
import { SearchBar } from "@/components/layout/SearchBar";
import { useCommerce } from "@/components/commerce/CommerceProvider";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setCartOpen } = useCommerce();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    ["Shop", "/shop"],
    ["Collections", "/collections"],
    ["Our story", "/about"],
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
      heading: "By occasion",
      items: [
        ["Birthdays", "/shop?occasion=birthdays"],
        ["Weddings", "/shop?occasion=weddings"],
        ["Anniversaries", "/shop?occasion=for-couples"],
        ["Housewarming", "/shop?occasion=housewarming"],
        ["Festivals & Rakhi", "/shop?occasion=festivals"],
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
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-sand-line/50 bg-parchment/80 shadow-soft backdrop-blur-xl"
          : "border-b border-sand-line/80 bg-parchment"
      }`}
    >
      <div className="container flex h-[72px] items-center justify-between gap-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02]">
          <Image
            src="/logo.svg"
            alt="Divine Karigari"
            width={44}
            height={44}
            className="h-10 w-10 sm:h-11 sm:w-11"
            priority
          />
          <span className="hidden font-display text-lg tracking-tight text-ink sm:block">
            Divine <span className="text-gradient-gold">Karigari</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {/* Gifts mega-menu */}
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-muted-ink transition-all duration-200 hover:bg-gold/5 hover:text-ink">
              Gifts
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-200 group-hover:rotate-180"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {/* Dropdown */}
            <div className="pointer-events-none absolute left-0 top-full pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="grid w-[560px] grid-cols-3 gap-6 rounded-soft-2xl border border-sand-line bg-warm-white p-6 shadow-lift-lg">
                {giftMenu.map((col) => (
                  <div key={col.heading}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                      {col.heading}
                    </p>
                    <div className="grid gap-2">
                      {col.items.map(([label, href]) => (
                        <Link
                          key={label + href}
                          href={href}
                          className="text-sm text-muted-ink transition-colors hover:text-oxblood"
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
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="relative rounded-full px-4 py-2 text-sm font-medium text-muted-ink transition-all duration-200 hover:bg-gold/5 hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <SearchBar />
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden rounded-full p-2.5 text-muted-ink transition-all duration-200 hover:bg-gold/5 hover:text-oxblood sm:block"
          >
            <Heart size={19} />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden rounded-full p-2.5 text-muted-ink transition-all duration-200 hover:bg-gold/5 hover:text-ink sm:block"
          >
            <UserRound size={19} />
          </Link>
          <button
            aria-label="Cart"
            onClick={() => setCartOpen(true)}
            className="relative rounded-full p-2.5 text-muted-ink transition-all duration-200 hover:bg-gold/5 hover:text-ink"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-gold px-1 text-[10px] font-medium text-parchment shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="rounded-full p-2.5 text-muted-ink transition-all duration-200 hover:bg-gold/5 hover:text-ink md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`absolute inset-x-0 top-full border-b border-sand-line/50 bg-parchment/95 shadow-lift backdrop-blur-xl transition-all duration-300 md:hidden ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav className="container grid gap-1 py-5">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-soft-lg px-4 py-3.5 font-display text-lg transition-all duration-200 hover:bg-gold/5"
            >
              {label}
            </Link>
          ))}
          {/* Gift categories on mobile */}
          <div className="mt-2 border-t border-sand-line/50 pt-3">
            <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Shop gifts
            </p>
            <div className="grid grid-cols-2 gap-1">
              {[
                ["Gifts for Her", "/shop?occasion=for-her"],
                ["Gifts for Him", "/shop?occasion=for-him"],
                ["For Couples", "/shop?occasion=for-couples"],
                ["For Kids", "/shop?occasion=for-kids"],
                ["Personalized", "/shop?category=personalized-gifts"],
                ["Home & Decor", "/shop?category=home-decor"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-soft px-4 py-2.5 text-sm text-muted-ink transition hover:bg-gold/5 hover:text-ink"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-3 flex gap-2 border-t border-sand-line/50 pt-4">
            <Link
              href="/wishlist"
              onClick={() => setOpen(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-soft border border-sand-line py-3 text-sm hover:border-gold hover:text-gold"
            >
              <Heart size={16} /> Wishlist
            </Link>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-soft border border-sand-line py-3 text-sm hover:border-gold hover:text-gold"
            >
              <UserRound size={16} /> Account
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
