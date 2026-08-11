"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import { fadeInUp, staggerChildren } from "@/lib/motion";

const testimonials = [
  {
    quote:
      "The little details made it feel like a gift made just for my sister. She still talks about the wrapping.",
    name: "Ananya S.",
    context: "Birthday gifting",
    rating: 5,
  },
  {
    quote:
      "Beautiful craft, very thoughtful packaging, and it arrived exactly when promised for our anniversary.",
    name: "Rohan M.",
    context: "Anniversary gifting",
    rating: 5,
  },
  {
    quote:
      "I wanted something meaningful for a housewarming and the brass name plate was perfect. Quietly special.",
    name: "Meera K.",
    context: "Housewarming",
    rating: 5,
  },
];

export function TestimonialsCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <motion.div
        ref={ref}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {testimonials.map((item) => (
          <motion.figure
            key={item.name}
            variants={fadeInUp}
            className="gradient-border min-w-[88%] snap-start p-7 sm:min-w-[calc(50%-10px)] lg:min-w-[calc(33.333%-14px)]"
          >
            {/* Quote icon with glow */}
            <div className="relative inline-block">
              <Quote className="text-gold" size={28} strokeWidth={1.4} />
              <div className="absolute inset-0 animate-pulse-glow rounded-full bg-gold/20 blur-xl" />
            </div>

            {/* Star rating */}
            <div className="mt-4 flex gap-0.5">
              {Array.from({ length: item.rating }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="fill-gold text-gold"
                  strokeWidth={0}
                />
              ))}
            </div>

            <blockquote className="mt-5 font-display text-xl leading-snug text-ink sm:text-2xl">
              &ldquo;{item.quote}&rdquo;
            </blockquote>

            <figcaption className="mt-8 flex items-center gap-3 border-t border-sand-line pt-4">
              {/* Avatar placeholder with gradient */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-xs font-semibold text-parchment">
                {item.name.charAt(0)}
              </div>
              <div className="text-sm">
                <span className="font-medium text-ink">{item.name}</span>
                <span className="ml-2 text-muted-ink">{item.context}</span>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>

      {/* Modern navigation buttons */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() =>
            ref.current?.scrollBy({ left: -320, behavior: "smooth" })
          }
          aria-label="Previous testimonials"
          className="group rounded-full border border-parchment/20 bg-parchment/10 p-3 backdrop-blur-sm transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:shadow-glow"
        >
          <ArrowLeft
            size={17}
            className="text-parchment transition-transform duration-300 group-hover:-translate-x-0.5"
          />
        </button>
        <button
          onClick={() =>
            ref.current?.scrollBy({ left: 320, behavior: "smooth" })
          }
          aria-label="Next testimonials"
          className="group rounded-full border border-parchment/20 bg-parchment/10 p-3 backdrop-blur-sm transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:shadow-glow"
        >
          <ArrowRight
            size={17}
            className="text-parchment transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </button>
        {/* Progress dots */}
        <div className="ml-auto flex gap-1.5">
          {testimonials.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === 0 ? "w-6 bg-gold" : "w-1.5 bg-parchment/30"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
