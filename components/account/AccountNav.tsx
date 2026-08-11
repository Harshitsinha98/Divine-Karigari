"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";

const links = [
  ["Overview", "/account"],
  ["My Orders", "/account/orders"],
  ["My Wallet", "/account/wallet"],
  ["Saved Addresses", "/account/addresses"],
  ["Payment Methods", "/account/payment-methods"],
  ["Profile Settings", "/account/profile"],
  ["My Reviews", "/account/reviews"],
];
export function AccountNav({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const active = links.find(([label, href]) =>
    href === "/account" ? pathname === href : pathname.startsWith(href),
  );
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };
  return (
    <aside className="lg:sticky lg:top-6 lg:h-fit">
      <div className="hidden lg:block">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">
          Your account
        </p>
        <p className="mt-2 font-display text-2xl">
          Hello, {name.split(" ")[0]}.
        </p>
        <nav className="mt-8 grid gap-1">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-soft px-4 py-3 text-sm transition ${active?.[1] === href ? "bg-ink text-parchment" : "text-muted-ink hover:bg-sand-line/25 hover:text-ink"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-8 flex items-center gap-2 px-4 text-sm text-muted-ink hover:text-oxblood"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-soft border border-sand-line px-4 py-3 text-sm"
        >
          <span>{active?.[0]}</span>
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
        {open && (
          <div className="mt-2 rounded-soft-xl border border-sand-line bg-parchment p-2 shadow-soft">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`block rounded-soft px-3 py-3 text-sm ${active?.[1] === href ? "bg-ink text-parchment" : "text-muted-ink"}`}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 border-t border-sand-line px-3 py-3 text-sm text-muted-ink"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
