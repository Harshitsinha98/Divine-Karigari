import Image from "next/image";
import Link from "next/link";

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=300&q=80`;

const circles: { label: string; href: string; seed: string }[] = [
  { label: "Rakhi", href: "/shop?category=rakhi-festive", seed: "photo-1599552683573-16b443d7a6a3" },
  { label: "Personalized", href: "/shop?category=personalized-gifts", seed: "photo-1600607687939-ce8a6c25118c" },
  { label: "Home & Decor", href: "/shop?category=home-decor", seed: "photo-1604014237800-1c9102c219da" },
  { label: "Jewelry", href: "/shop?category=jewelry-accessories", seed: "photo-1535632066927-ab7c9ab60908" },
  { label: "For Her", href: "/shop?occasion=for-her", seed: "photo-1513519245088-0e12902e35ca" },
  { label: "For Him", href: "/shop?occasion=for-him", seed: "photo-1600607687939-ce8a6c25118c" },
  { label: "Birthdays", href: "/shop?occasion=birthdays", seed: "photo-1599552683573-16b443d7a6a3" },
  { label: "Custom Bouquet", href: "/#gift-builder", seed: "photo-1604014237800-1c9102c219da" },
];

export function CategoryCircles() {
  return (
    <div className="flex snap-x gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible lg:grid-cols-8">
      {circles.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          className="group flex w-20 shrink-0 snap-start flex-col items-center gap-2 sm:w-auto"
        >
          <span className="relative h-20 w-20 overflow-hidden rounded-full border border-sand-line shadow-soft transition duration-300 group-hover:border-tulsi group-hover:shadow-lift">
            <Image
              src={img(c.seed)}
              alt={c.label}
              fill
              sizes="80px"
              className="object-cover transition duration-500 group-hover:scale-110"
            />
          </span>
          <span className="text-center text-xs font-medium text-ink transition group-hover:text-tulsi">
            {c.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
