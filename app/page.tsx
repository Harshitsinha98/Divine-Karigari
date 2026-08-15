import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { ProductRail } from "@/components/home/ProductRail";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { CategoryCircles } from "@/components/home/CategoryCircles";
import { OccasionRelations } from "@/components/home/OccasionRelations";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { SocialProofGrid } from "@/components/home/SocialProofGrid";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { Reveal } from "@/components/motion/Reveal";
import { ParallaxSection, FloatingDecor } from "@/components/motion/ParallaxSection";
import { GiftBuilderStudio } from "@/components/home/GiftBuilderStudio";
import {
  getBuilderItems,
  getHomepageProducts,
  getListingProducts,
} from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Handcrafted & Personalized Gifts",
  "Discover premium handcrafted and personalized gifts for festivals, weddings, birthdays, and meaningful moments.",
  "/",
);

export default async function Home() {
  const [
    newArrivals,
    bestsellersResult,
    rakhiResult,
    personalizedResult,
    bouquetBuilder,
    giftboxBuilder,
  ] = await Promise.all([
    getHomepageProducts(),
    getListingProducts({ sort: "popularity" }),
    getListingProducts({ category: "rakhi-festive" }),
    getListingProducts({ category: "personalized-gifts" }),
    getBuilderItems("bouquet"),
    getBuilderItems("giftbox"),
  ]);

  const bestsellers = bestsellersResult.products;
  const personalized = personalizedResult.products;

  let rakhiProducts = rakhiResult.products;
  if (!rakhiProducts.length) {
    rakhiProducts = (await getListingProducts({ occasion: "festivals" }))
      .products;
  }
  if (!rakhiProducts.length) rakhiProducts = newArrivals.slice(0, 8);

  return (
    <main className="overflow-hidden">
      {/* ═══════════════════════════════════════════════
          HERO — Auto-rotating offers carousel
      ═══════════════════════════════════════════════ */}
      <section className="container pt-5 sm:pt-6">
        <PromoCarousel />
      </section>

      {/* ═══════════════════════════════════════════════
          CATEGORY CIRCLES — Quick shortcuts
      ═══════════════════════════════════════════════ */}
      <section className="container pt-8 sm:pt-12">
        <Reveal>
          <CategoryCircles />
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════
          SHOP BY OCCASIONS & RELATIONS
      ═══════════════════════════════════════════════ */}
      <section className="container py-12 sm:py-16">
        <Reveal>
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl">
              Shop by Occasions &amp; Relations
            </h2>
            <p className="mt-2 text-sm text-muted-ink">
              Surprise your loved ones
            </p>
          </div>
          <OccasionRelations />
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════
          GIFT BUILDER — Customizable bouquet & gift box
      ═══════════════════════════════════════════════ */}
      <section
        id="gift-builder"
        className="container scroll-mt-28 pb-4 pt-2 sm:pt-4"
      >
        <Reveal>
          <GiftBuilderStudio
            bouquetItems={bouquetBuilder.items}
            giftboxItems={giftboxBuilder.items}
            demo={bouquetBuilder.demo && giftboxBuilder.demo}
          />
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════
          NEW ARRIVALS — Product rail
      ═══════════════════════════════════════════════ */}
      <section className="container pb-4 pt-12 sm:pt-16">
        <ProductRail
          eyebrow="Just in"
          accent="gold"
          title={
            <>
              New <span className="text-gradient-gold">arrivals.</span>
            </>
          }
          description="The latest handcrafted pieces from our artisan partners, freshly added."
          viewAllHref="/shop"
          viewAllLabel="View all"
          products={newArrivals}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          FESTIVE RAKHI COLLECTION
      ═══════════════════════════════════════════════ */}
      <section className="relative mt-12 overflow-hidden border-y border-gold/20 sm:mt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-oxblood/10 via-white to-tulsi/10" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-radial from-gold/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-gradient-radial from-tulsi/10 to-transparent blur-3xl" />

        <div className="container relative py-20 sm:py-24">
          <Reveal>
            <div className="mb-12 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-oxblood/25 bg-oxblood/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-oxblood">
                  <Sparkles size={12} />
                  Raksha Bandhan &middot; Limited edition
                </span>
                <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                  The Rakhi{" "}
                  <span className="text-gradient-gold">collection.</span>
                </h2>
                <p className="mt-3 max-w-lg text-base text-muted-ink">
                  Handcrafted rakhis, thoughtful hampers, and personalized
                  keepsakes — for the bond that keeps growing. Order early to
                  gift on time.
                </p>
              </div>
              <Link
                href="/shop?category=rakhi-festive"
                className="group inline-flex items-center gap-2 rounded-full bg-oxblood px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-oxblood/90 hover:shadow-lift"
              >
                Shop all Rakhi
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <ProductCarousel products={rakhiProducts} />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          BESTSELLERS
      ═══════════════════════════════════════════════ */}
      <section className="relative border-b border-sand-line">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-cream to-white" />
        <div className="container relative py-20 sm:py-24">
          <Reveal>
            <div className="mb-12 flex items-end justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-tulsi/20 bg-tulsi/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-tulsi">
                  <span className="h-1 w-1 rounded-full bg-tulsi" />
                  Most loved
                </span>
                <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                  Made to be{" "}
                  <span className="text-gradient-gold">remembered.</span>
                </h2>
                <p className="mt-3 max-w-md text-base text-muted-ink">
                  Our community&apos;s favorites — pieces that keep getting
                  chosen for their craft and care.
                </p>
              </div>
              <Link
                href="/shop"
                className="group inline-flex items-center gap-1 rounded-full border border-sand-line px-5 py-2.5 text-sm font-medium text-ink transition-all duration-300 hover:border-tulsi hover:bg-tulsi/5 hover:text-tulsi"
              >
                Shop bestsellers
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <ProductCarousel products={bestsellers} />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PERSONALIZED PICKS
      ═══════════════════════════════════════════════ */}
      <section className="container py-20 sm:py-24">
        <ProductRail
          eyebrow="Make it personal"
          accent="tulsi"
          title={
            <>
              Personalized <span className="text-gradient-gold">picks.</span>
            </>
          }
          description="Add a name, a date, or a message — gifts made to feel one of a kind."
          viewAllHref="/shop?category=personalized-gifts"
          viewAllLabel="Shop personalized"
          products={personalized}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          CRAFT STORY
      ═══════════════════════════════════════════════ */}
      <section className="relative container py-20 sm:py-24">
        <FloatingDecor
          speed={0.3}
          className="absolute -right-10 top-40 h-60 w-60 rounded-full bg-gradient-radial from-tulsi/8 to-transparent blur-2xl"
        />
        <Reveal>
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
            <ParallaxSection speed={0.2} className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-soft-3xl shadow-lift-lg">
                <Image
                  src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80"
                  alt="Artisanal craft details in a warm home setting"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/20 to-transparent" />
              </div>
              <div className="absolute -bottom-4 right-0 rounded-soft-xl border border-sand-line bg-white/95 p-4 shadow-lift backdrop-blur-sm sm:-bottom-6 sm:-right-10 sm:p-5">
                <p className="font-display text-2xl text-gold sm:text-3xl">15+</p>
                <p className="text-xs text-muted-ink">Years of craft tradition</p>
              </div>
            </ParallaxSection>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-tulsi/15 bg-tulsi/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-tulsi">
                <span className="h-1 w-1 rounded-full bg-tulsi" />
                Our craft
              </span>
              <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
                The beauty of the hand is{" "}
                <span className="text-gradient-gold">never accidental.</span>
              </h2>
              <p className="mt-6 text-base leading-8 text-muted-ink">
                Divine Karigari began with a simple belief: the things we give
                should carry a little of where they came from. We work with
                Indian makers who bring generations of skill to wood, metal,
                fibre, colour, and clay.
              </p>
              <p className="mt-5 text-base leading-8 text-muted-ink">
                Every piece is made in small batches, finished by human hands,
                and chosen to make another person feel seen.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Small Batch", "Handcrafted", "Eco-Friendly", "Made in India"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-sand-line bg-white px-3 py-1.5 text-xs font-medium text-muted-ink"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
              <Link
                href="/about"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-oxblood transition-all duration-300 hover:text-tulsi"
              >
                Read our story
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-tulsi text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-tulsi via-tulsi-light/20 to-tulsi" />
        <div className="pointer-events-none absolute -right-40 top-10 h-80 w-80 rounded-full bg-gradient-radial from-gold/10 to-transparent blur-3xl" />
        <div className="container relative py-20 sm:py-24">
          <Reveal>
            <div className="mb-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white">
                <span className="h-1 w-1 rounded-full bg-gold-light" />
                Kind words
              </span>
              <h2 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl">
                Gifts that stay <span className="text-gold-light">with you.</span>
              </h2>
              <p className="mt-3 max-w-md text-base text-white/70">
                Don&apos;t take our word for it — hear from people who&apos;ve
                gifted with love.
              </p>
            </div>
          </Reveal>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SOCIAL PROOF
      ═══════════════════════════════════════════════ */}
      <section className="container py-20 sm:py-24">
        <Reveal>
          <div className="mb-12 flex items-end justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold">
                <span className="h-1 w-1 rounded-full bg-gold" />
                From our community
              </span>
              <h2 className="mt-5 font-display text-4xl sm:text-5xl">
                A little joy, <span className="text-gradient-gold">shared.</span>
              </h2>
            </div>
            <span className="hidden items-center gap-2 rounded-full border border-sand-line px-4 py-2 text-sm text-muted-ink sm:inline-flex">
              @divinekarigari
            </span>
          </div>
        </Reveal>
        <SocialProofGrid />
      </section>

      {/* ═══════════════════════════════════════════════
          NEWSLETTER
      ═══════════════════════════════════════════════ */}
      <section className="container pb-20 sm:pb-24">
        <Reveal>
          <div className="gradient-border relative overflow-hidden rounded-soft-2xl p-10 sm:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-radial from-gold/10 to-transparent blur-2xl" />
            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold">
                  <span className="h-1 w-1 rounded-full bg-gold" />
                  The gifting note
                </span>
                <h2 className="mt-5 font-display text-3xl leading-tight sm:text-4xl">
                  Stories, new arrivals &{" "}
                  <span className="text-gradient-gold">a little inspiration.</span>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-ink">
                  Join our community for early access to new collections,
                  behind-the-scenes stories, and exclusive offers.
                </p>
              </div>
              <NewsletterForm />
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
