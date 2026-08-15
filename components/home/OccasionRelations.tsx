import Image from "next/image";
import Link from "next/link";

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=600&q=80`;

const items: { label: string; href: string; seed: string }[] = [
  { label: "Birthday Gifts", href: "/shop?occasion=birthdays", seed: "photo-1490481651871-ab68de25d43d" },
  { label: "Anniversary Gifts", href: "/shop?occasion=for-couples", seed: "photo-1549465220-1a8b9238cd48" },
  { label: "Gifts for Him", href: "/shop?occasion=for-him", seed: "photo-1522673607200-164d1b6ce486" },
  { label: "Gifts for Her", href: "/shop?occasion=for-her", seed: "photo-1513885535751-8b9238bd345a" },
];

export function OccasionRelations() {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-6">
      {items.map((it) => (
        <Link key={it.label} href={it.href} className="group">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[9999px_9999px_16px_16px] border border-sand-line shadow-soft transition duration-300 group-hover:shadow-lift">
            <Image
              src={img(it.seed)}
              alt={it.label}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
          </div>
          <p className="mt-3 text-center text-sm font-medium text-ink transition group-hover:text-tulsi">
            {it.label}
          </p>
        </Link>
      ))}
    </div>
  );
}
