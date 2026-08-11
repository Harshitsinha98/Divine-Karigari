"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

type Suggestion = { name: string; slug: string; category: string };

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      );
      if (response.ok) setSuggestions((await response.json()).data);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close search" : "Search"}
        className="rounded-full p-2.5 hover:bg-sand-line/30"
      >
        {open ? <X size={19} /> : <Search size={19} />}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(90vw,360px)] rounded-soft-xl border border-sand-line bg-parchment p-3 shadow-lift">
          <div className="flex items-center gap-2 border-b border-sand-line px-2 pb-2">
            <Search size={17} className="text-gold" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search gifts..."
              aria-label="Search gifts"
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-ink/70"
            />
          </div>
          {query.length > 1 && (
            <div className="pt-2">
              {suggestions.length ? (
                suggestions.map((suggestion) => (
                  <Link
                    key={suggestion.slug}
                    href={`/shop/${suggestion.slug}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-soft px-3 py-2.5 hover:bg-sand-line/25"
                  >
                    <span className="block text-sm">{suggestion.name}</span>
                    <span className="mt-1 block text-xs text-muted-ink">
                      {suggestion.category}
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
      )}
    </div>
  );
}
