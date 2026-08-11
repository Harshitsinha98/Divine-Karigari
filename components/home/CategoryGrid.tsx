import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { homepageCategories } from "@/lib/catalog";

export function CategoryGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {homepageCategories.map((category, index) => (
        <Link
          key={category.slug}
          href={`/shop?category=${category.slug}`}
          className={`group relative min-h-80 overflow-hidden rounded-soft-xl ${index === 0 ? "sm:row-span-2 sm:min-h-full" : ""}`}
        >
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 text-parchment">
            <p className="font-display text-2xl capitalize">{category.name}</p>
            <p className="mt-1 text-sm text-parchment/75">{category.note}</p>
            <span className="mt-4 inline-flex rounded-full border border-parchment/50 p-2 transition group-hover:border-gold group-hover:text-gold">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
