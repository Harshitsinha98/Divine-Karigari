"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oxblood">
        Something went wrong
      </p>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl">
        A small <span className="text-gradient-gold">hiccup.</span>
      </h1>
      <p className="mt-4 max-w-md text-sm text-muted-ink">
        We hit an unexpected error. Please try again — if it keeps happening,
        reach out and we&apos;ll sort it out quickly.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-sand-line px-6 py-3 text-sm font-medium text-ink transition hover:border-tulsi hover:text-tulsi"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
