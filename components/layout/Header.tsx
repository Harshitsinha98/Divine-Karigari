"use client";
import { useState } from "react";
import Link from "next/link";
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
  const { cartCount, setCartOpen } = useCommerce();
  const links = [
    ["Shop", "/shop"],
    ["Collections", "/collections"],
    ["Our story", "/about"],
  ];
  return (
    <header className="relative z-40 border-b border-sand-line/80 bg-parchment/95">
      <div className="container flex h-20 items-center justify-between gap-5">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight text-ink"
        >
          Divine <span className="text-gold">Karigari</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-ink md:flex">
          {links.map(([label, href]) => (
            <Link key={href} className="hover:text-oxblood" href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <SearchBar />
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden rounded-full p-2.5 hover:bg-sand-line/30 sm:block"
          >
            <Heart size={19} />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden rounded-full p-2.5 hover:bg-sand-line/30 sm:block"
          >
            <UserRound size={19} />
          </Link>
          <button
            aria-label="Cart"
            onClick={() => setCartOpen(true)}
            className="relative rounded-full p-2.5 hover:bg-sand-line/30"
          >
            <ShoppingBag size={19} />
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-oxblood px-1 text-[10px] text-parchment">
              {cartCount}
            </span>
          </button>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="rounded-full p-2.5 hover:bg-sand-line/30 md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div
        className={`absolute inset-x-0 top-full border-b border-sand-line bg-parchment px-5 shadow-soft transition duration-300 md:hidden ${open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}
      >
        <nav className="container grid gap-1 py-5 font-display text-lg">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="border-b border-sand-line/70 py-4"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
