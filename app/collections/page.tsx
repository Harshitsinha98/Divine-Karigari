import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { PageIntro } from "@/components/pages/PageIntro";
import { homepageCategories } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Collections",
  "Browse our curated collections of handcrafted gifts — from personalized keepsakes to festive celebrations.",
  "/collections",
);

export default function CollectionsPage() {
  return (
    <main className="container py-16 sm:py-24">
      <PageIntro
        eyebrow="Our collections"
        title="Curated with care."
      >
        Every collection tells a story — explore gifts grouped by the moments
        they&apos;re made for.
      </PageIntro>

      <Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {homepageCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-soft-2xl sm:min-h-[400px]"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
              <div className="relative p-7 text-parchment sm:p-9">
                <p className="font-display text-3xl capitalize sm:text-4xl">
                  {category.name}
                </p>
                <p className="mt-2 text-sm text-parchment/70">
                  {category.note}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold transition-all duration-300 group-hover:gap-3">
                  Explore collection
                  <ArrowUpRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </main>
  );
}
