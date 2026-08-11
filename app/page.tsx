import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { RangoliMotif } from "@/components/ui/RangoliMotif";
import {
  HeroBadge,
  HeroCopy,
  HeroEyebrow,
  HeroHeading,
  HeroIntro,
  HeroOrbs,
} from "@/components/home/HeroIntro";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { SocialProofGrid } from "@/components/home/SocialProofGrid";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { Reveal } from "@/components/motion/Reveal";
import { ParallaxSection, FloatingDecor } from "@/components/motion/ParallaxSection";
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
    <main className="overflow-hidden">
      {/* ═══════════════════════════════════════════════
          HERO SECTION — Modern with floating orbs & gradient bg
      ═══════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden">
        {/* Animated gradient background orbs */}
        <HeroOrbs />

        {/* Subtle dot pattern overlay */}
        <div className="pointer-events-none absolute inset-0 -z-10 dot-pattern opacity-[0.03]" />

        <div className="container relative grid min-h-[680px] items-center gap-10 py-20 sm:min-h-[750px] lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          {/* Animated Rangoli — subtle background */}
          <RangoliMotif className="pointer-events-none absolute -right-32 top-10 -z-10 h-[400px] w-[400px] text-gold/30 sm:right-0 sm:h-[500px] sm:w-[500px] animate-spin-slow" />

          {/* Left: Text content */}
          <HeroIntro>
            <div className="max-w-2xl">
              {/* Modern badge/pill */}
              <HeroBadge>
                <span className="text-xs font-medium text-gold">
                  Handcrafted in India
                </span>
              </HeroBadge>

              <HeroEyebrow>
                <span className="block text-xs font-medium uppercase tracking-[0.3em] text-oxblood/80">
                  Artisanal gifting &middot; Since 2020
                </span>
              </HeroEyebrow>

              <HeroHeading>
                <span className="mt-4 block font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl lg:text-[5.5rem]">
                  Gifts with a<br />
                  little more{" "}
                  <span className="text-gradient-gold">meaning.</span>
                </span>
              </HeroHeading>

              <HeroCopy>
                <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-ink sm:text-lg">
                  Beautiful, considered pieces for the people and moments that
                  matter. Every piece tells a story of Indian craftsmanship.
                </p>
                <div className="mt-9 flex flex-wrap gap-4">
                  <Button className="shadow-glow">
                    Explore the collection
                  </Button>
                  <Link
                    href="/about"
                    className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-sand-line/80 px-6 text-sm font-medium transition-all duration-300 hover:border-gold hover:bg-gold/5 hover:text-gold hover:shadow-soft"
                  >
                    Our story
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                      &rarr;
                    </span>
                  </Link>
                </div>

                {/* Social proof mini stats */}
                <div className="mt-12 flex items-center gap-6 border-t border-sand-line/50 pt-6">
                  <div>
                    <p className="font-display text-2xl text-ink">2000+</p>
                    <p className="text-xs text-muted-ink">Happy customers</p>
                  </div>
                  <div className="h-8 w-px bg-sand-line/50" />
                  <div>
                    <p className="font-display text-2xl text-ink">50+</p>
                    <p className="text-xs text-muted-ink">Artisan partners</p>
                  </div>
                  <div className="h-8 w-px bg-sand-line/50" />
                  <div>
                    <p className="font-display text-2xl text-ink">4.9</p>
                    <p className="text-xs text-muted-ink">Average rating</p>
                  </div>
                </div>
              </HeroCopy>
            </div>
          </HeroIntro>

          {/* Right: Hero visual — floating product collage */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square">
              {/* Main product image */}
              <div className="absolute inset-[10%] overflow-hidden rounded-soft-3xl shadow-lift-lg">
                <Image
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
                  alt="Handcrafted gift box with artisan details"
                  fill
                  sizes="40vw"
                  className="object-cover"
                  priority
                />
              </div>
              {/* Small floating card top-right */}
              <div className="absolute -right-2 top-[5%] rounded-soft-xl border border-sand-line/50 bg-parchment/90 p-4 shadow-lift backdrop-blur-sm animate-float-gentle">
                <p className="text-xs text-muted-ink">Bestseller</p>
                <p className="mt-0.5 font-display text-sm">Brass Name Plate</p>
                <p className="mt-1 text-sm font-medium text-gold">&rupee;2,499</p>
              </div>
              {/* Small floating card bottom-left */}
              <div className="absolute -left-4 bottom-[15%] rounded-soft-xl border border-sand-line/50 bg-parchment/90 p-4 shadow-lift backdrop-blur-sm animate-float-slow">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-[10px]">A</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-oxblood/20 text-[10px]">R</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-tulsi/20 text-[10px]">M</span>
                  </div>
                  <span className="text-xs text-muted-ink">2000+ happy gifters</span>
                </div>
              </div>
              {/* Decorative ring */}
              <div className="absolute inset-[3%] rounded-full border border-dashed border-gold/20 animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-parchment to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════════
          CATEGORY GRID — With modern section header
      ═══════════════════════════════════════════════ */}
      <section className="relative container py-24 sm:py-32">
        {/* Floating decorative element */}
        <FloatingDecor
          speed={0.4}
          className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-gradient-radial from-gold/8 to-transparent blur-2xl"
        />

        <Reveal>
          <div className="mb-12 flex items-end justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold">
                <span className="h-1 w-1 rounded-full bg-gold" />
                Find your feeling
              </span>
              <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Gifts for every kind
                <br className="hidden sm:block" /> of{" "}
                <span className="text-gradient-gold">moment.</span>
              </h2>
            </div>
            <Link
              href="/shop"
              className="group hidden items-center gap-1 rounded-full border border-sand-line px-5 py-2.5 text-sm font-medium text-ink transition-all duration-300 hover:border-gold hover:bg-gold/5 hover:text-gold sm:inline-flex"
            >
              View all gifts
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
          </div>
        </Reveal>
        <CategoryGrid />
      </section>

      {/* ═══════════════════════════════════════════════
          BESTSELLERS CAROUSEL — With gradient divider
      ═══════════════════════════════════════════════ */}
      <section className="relative border-y border-sand-line/50">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-parchment via-cream to-parchment" />

        <div className="container relative py-24 sm:py-32">
          <Reveal>
            <div className="mb-12 flex items-end justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-oxblood/15 bg-oxblood/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-oxblood">
                  <span className="h-1 w-1 rounded-full bg-oxblood" />
                  Most loved
                </span>
                <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                  Made to be{" "}
                  <span className="text-gradient-gold">remembered.</span>
                </h2>
                <p className="mt-3 max-w-md text-base text-muted-ink">
                  Our community&apos;s favorites — pieces that keep getting chosen for their craft and care.
                </p>
              </div>
              <Link
                href="/shop"
                className="group hidden items-center gap-1 rounded-full border border-sand-line px-5 py-2.5 text-sm font-medium text-ink transition-all duration-300 hover:border-gold hover:bg-gold/5 hover:text-gold sm:inline-flex"
              >
                Shop bestsellers
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <ProductCarousel products={products} />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CRAFT STORY — Split layout with parallax image
      ═══════════════════════════════════════════════ */}
      <section className="relative container py-24 sm:py-32">
        <FloatingDecor
          speed={0.3}
          className="absolute -right-10 top-40 h-60 w-60 rounded-full bg-gradient-radial from-oxblood/6 to-transparent blur-2xl"
        />

        <Reveal>
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
            {/* Image with modern frame */}
            <ParallaxSection speed={0.2} className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-soft-3xl shadow-lift-lg">
                <Image
                  src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80"
                  alt="Artisanal craft details in a warm home setting"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/20 to-transparent" />
              </div>
              {/* Floating accent card */}
              <div className="absolute -bottom-6 -right-6 rounded-soft-xl border border-sand-line/50 bg-parchment/90 p-5 shadow-lift backdrop-blur-sm sm:-right-10">
                <p className="font-display text-3xl text-gold">15+</p>
                <p className="text-xs text-muted-ink">Years of craft tradition</p>
              </div>
            </ParallaxSection>

            {/* Text content */}
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

              {/* Feature pills */}
              <div className="mt-8 flex flex-wrap gap-2">
                {["Small Batch", "Handcrafted", "Eco-Friendly", "Made in India"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-sand-line bg-parchment px-3 py-1.5 text-xs font-medium text-muted-ink"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>

              <Link
                href="/about"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-oxblood transition-all duration-300 hover:text-gold"
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
          TESTIMONIALS — Dark section with gradient
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-tulsi text-parchment">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-tulsi via-tulsi-light/20 to-tulsi" />

        {/* Decorative floating orb */}
        <div className="pointer-events-none absolute -right-40 top-10 h-80 w-80 rounded-full bg-gradient-radial from-gold/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-10 h-60 w-60 rounded-full bg-gradient-radial from-parchment/5 to-transparent blur-3xl" />

        <div className="container relative py-24 sm:py-32">
          <Reveal>
            <div className="mb-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold">
                <span className="h-1 w-1 rounded-full bg-gold" />
                Kind words
              </span>
              <h2 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl">
                Gifts that stay{" "}
                <span className="text-gold">with you.</span>
              </h2>
              <p className="mt-3 max-w-md text-base text-parchment/60">
                Don&apos;t take our word for it — hear from people who&apos;ve gifted with love.
              </p>
            </div>
          </Reveal>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SOCIAL PROOF / INSTAGRAM GRID
      ═══════════════════════════════════════════════ */}
      <section className="container py-24 sm:py-32">
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
          NEWSLETTER — Modern card with gradient border
      ═══════════════════════════════════════════════ */}
      <section className="container pb-24 sm:pb-32">
        <Reveal>
          <div className="gradient-border relative overflow-hidden rounded-soft-2xl p-10 sm:p-14">
            {/* Background decoration */}
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
