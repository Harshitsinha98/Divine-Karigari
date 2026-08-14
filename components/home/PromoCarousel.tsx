"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Slide = {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
  image: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Raksha Bandhan Special",
    title: "Rakhi gifts that say it",
    highlight: "beautifully.",
    subtitle:
      "Handcrafted rakhis, thalis & personalized keepsakes for the bond that keeps growing.",
    ctaLabel: "Shop Rakhi collection",
    href: "/shop?category=rakhi-festive",
    image:
      "https://images.unsplash.com/photo-1599552683573-16b443d7a6a3?auto=format&fit=crop&w=1600&q=80",
  },
  {
    eyebrow: "New Arrivals",
    title: "Fresh from our",
    highlight: "artisans.",
    subtitle:
      "Small-batch pieces, just added — made by hand, made to be gifted.",
    ctaLabel: "Explore new arrivals",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    eyebrow: "Personalized Gifts",
    title: "Add their name,",
    highlight: "make it theirs.",
    subtitle:
      "Custom engraving and personalization on our most-loved handcrafted gifts.",
    ctaLabel: "Personalize a gift",
    href: "/shop?category=personalized-gifts",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=1600&q=80",
  },
];

export function PromoCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;
  const go = useCallback(
    (n: number) => setIndex((i) => (i + n + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 5500);
    return () => clearInterval(timer);
  }, [paused, count]);

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-soft-3xl shadow-lift-lg sm:aspect-[21/9]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.image}
            alt={slide.eyebrow}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent" />
          <div className="relative flex h-full flex-col justify-center gap-4 p-8 sm:p-14 lg:p-20">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
              <span className="h-1 w-1 rounded-full bg-gold" />
              {slide.eyebrow}
            </span>
            <h2 className="max-w-xl font-display text-3xl leading-[1.08] text-parchment sm:text-5xl lg:text-6xl">
              {slide.title}{" "}
              {slide.highlight && (
                <span className="text-gold-light">{slide.highlight}</span>
              )}
            </h2>
            <p className="max-w-md text-sm text-parchment/80 sm:text-base">
              {slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition duration-300 hover:bg-gold-light hover:shadow-glow"
            >
              {slide.ctaLabel}
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      ))}

      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-parchment/30 bg-ink/30 p-2.5 text-parchment backdrop-blur-sm transition hover:bg-ink/50 sm:block"
      >
        <ArrowLeft size={18} />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-parchment/30 bg-ink/30 p-2.5 text-parchment backdrop-blur-sm transition hover:bg-ink/50 sm:block"
      >
        <ArrowRight size={18} />
      </button>

      <div className="absolute bottom-5 left-8 flex gap-2 sm:left-14 lg:left-20">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index
                ? "w-7 bg-gold"
                : "w-3 bg-parchment/50 hover:bg-parchment/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
