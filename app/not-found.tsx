import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        404
      </p>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl">
        This page has <span className="text-gradient-gold">wandered off.</span>
      </h1>
      <p className="mt-4 max-w-md text-sm text-muted-ink">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Let&apos;s find you something beautiful instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink/90"
        >
          Back to home
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-sand-line px-6 py-3 text-sm font-medium text-ink transition hover:border-tulsi hover:text-tulsi"
        >
          Browse gifts
        </Link>
      </div>
    </main>
  );
}
