import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { RangoliMotif } from "@/components/ui/RangoliMotif";
import {
  HeroCopy,
  HeroEyebrow,
  HeroHeading,
  HeroIntro,
} from "@/components/home/HeroIntro";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { SocialProofGrid } from "@/components/home/SocialProofGrid";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { Reveal } from "@/components/motion/Reveal";
import { getHomepageProducts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Handcrafted & Personalized Gifts",
  "Discover premium handcrafted and personalized gifts for festivals, weddings, birthdays, and meaningful moments.",
  "/",
);

export default async function Home() {
  const products = await getHomepageProducts();
  return (
    <main>
      <section className="relative isolate overflow-hidden">
        <div className="container relative flex min-h-[650px] items-center py-24 sm:min-h-[700px]">
          <RangoliMotif className="pointer-events-none absolute -right-40 top-5 -z-10 h-[570px] w-[570px] text-gold/70 sm:right-0 sm:h-[680px] sm:w-[680px]" />
          <HeroIntro>
            <div className="max-w-2xl">
              <HeroEyebrow>
                <span className="mb-6 block text-xs font-medium uppercase tracking-[0.25em] text-oxblood">
                  Handcrafted gifting · made in India
                </span>
              </HeroEyebrow>
              <HeroHeading>
                <span className="block font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">
                  Gifts with a little more{" "}
                  <em className="text-oxblood">meaning.</em>
                </span>
              </HeroHeading>
              <HeroCopy>
                <p className="mt-7 max-w-lg text-base leading-8 text-muted-ink sm:text-lg">
                  Beautiful, considered pieces for the people and moments that
                  matter.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button>Explore the collection</Button>
                  <Link
                    href="/about"
                    className="inline-flex min-h-11 items-center rounded-soft border border-sand-line px-5 text-sm font-medium hover:border-gold hover:text-gold"
                  >
                    Our story
                  </Link>
                </div>
              </HeroCopy>
            </div>
          </HeroIntro>
        </div>
      </section>
      <section className="container py-20 sm:py-28">
        <Reveal>
          <div className="mb-9 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-gold">
                Find your feeling
              </p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">
                Gifts for every kind of moment.
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden text-sm font-medium text-oxblood hover:text-gold sm:block"
            >
              View all gifts →
            </Link>
          </div>
          <CategoryGrid />
        </Reveal>
      </section>
      <section className="border-y border-sand-line bg-parchment/60">
        <div className="container py-20 sm:py-28">
          <Reveal>
            <div className="mb-9 flex items-end justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-gold">
                  Most loved
                </p>
                <h2 className="mt-3 font-display text-4xl sm:text-5xl">
                  Made to be remembered.
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden text-sm font-medium text-oxblood hover:text-gold sm:block"
              >
                Shop bestsellers →
              </Link>
            </div>
            <ProductCarousel products={products} />
          </Reveal>
        </div>
      </section>
      <section className="container py-20 sm:py-28">
        <Reveal>
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
            <div className="relative aspect-[4/5] overflow-hidden rounded-soft-xl">
              <Image
                src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80"
                alt="Artisanal craft details in a warm home setting"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-gold">
                Our craft
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
                The beauty of the hand is never accidental.
              </h2>
              <p className="mt-6 text-base leading-8 text-muted-ink">
                Divine Karigari began with a simple belief: the things we give
                should carry a little of where they came from. We work with
                Indian makers who bring generations of skill to wood, metal,
                fibre, colour, and clay — then we give those beautiful things a
                place in modern rituals of gifting.
              </p>
              <p className="mt-5 text-base leading-8 text-muted-ink">
                Every piece is made in small batches, finished by human hands,
                and chosen to make another person feel seen.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex text-sm font-medium text-oxblood hover:text-gold"
              >
                Read our story →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
      <section className="bg-tulsi text-parchment">
        <div className="container py-20 sm:py-28">
          <Reveal>
            <div className="mb-9">
              <p className="text-xs uppercase tracking-[0.22em] text-gold">
                Kind words
              </p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">
                Gifts that stay with you.
              </h2>
            </div>
            <TestimonialsCarousel />
          </Reveal>
        </div>
      </section>
      <section className="container py-20 sm:py-28">
        <Reveal>
          <div className="mb-9 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-gold">
                From our community
              </p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">
                A little joy, shared.
              </h2>
            </div>
            <span className="hidden text-sm text-muted-ink sm:block">
              @divinekarigari
            </span>
          </div>
          <SocialProofGrid />
        </Reveal>
      </section>
      <section className="border-t border-sand-line">
        <div className="container flex flex-col gap-8 py-16 sm:flex-row sm:items-center sm:justify-between sm:py-20">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gold">
              The gifting note
            </p>
            <h2 className="mt-3 font-display text-4xl">
              Beautiful things, occasionally.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-ink">
              First looks, maker stories, and thoughtful gifting ideas — no
              noise.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}
