import Image from "next/image";
import Link from "next/link";

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=600&q=80`;

const items: { label: string; href: string; seed: string }[] = [
  { label: "Birthday Gifts", href: "/shop?occasion=birthdays", seed: "photo-1599552683573-16b443d7a6a3" },
  { label: "Anniversary Gifts", href: "/shop?occasion=for-couples", seed: "photo-1600607687939-ce8a6c25118c" },
  { label: "Gifts for Him", href: "/shop?occasion=for-him", seed: "photo-1604014237800-1c9102c219da" },
  { label: "Gifts for Her", href: "/shop?occasion=for-her", seed: "photo-1513519245088-0e12902e35ca" },
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
