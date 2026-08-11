"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "The little details made it feel like a gift made just for my sister. She still talks about the wrapping.",
    name: "Ananya S.",
    context: "Birthday gifting",
  },
  {
    quote:
      "Beautiful craft, very thoughtful packaging, and it arrived exactly when promised for our anniversary.",
    name: "Rohan M.",
    context: "Anniversary gifting",
  },
  {
    quote:
      "I wanted something meaningful for a housewarming and the brass name plate was perfect. Quietly special.",
    name: "Meera K.",
    context: "Housewarming",
  },
];

export function TestimonialsCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((item) => (
          <figure
            key={item.name}
            className="min-w-[88%] snap-start rounded-soft-xl border border-sand-line bg-parchment p-7 sm:min-w-[calc(50%-10px)] lg:min-w-[calc(33.333%-14px)]"
          >
            <Quote className="text-gold" size={25} strokeWidth={1.4} />
            <blockquote className="mt-6 font-display text-2xl leading-snug">
              “{item.quote}”
            </blockquote>
            <figcaption className="mt-8 border-t border-sand-line pt-4 text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="ml-3 text-muted-ink">{item.context}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        <button
          onClick={() =>
            ref.current?.scrollBy({ left: -320, behavior: "smooth" })
          }
          aria-label="Previous testimonials"
          className="rounded-full border border-sand-line p-2.5 hover:border-gold hover:text-gold"
        >
          <ArrowLeft size={17} />
        </button>
        <button
          onClick={() =>
            ref.current?.scrollBy({ left: 320, behavior: "smooth" })
          }
          aria-label="Next testimonials"
          className="rounded-full border border-sand-line p-2.5 hover:border-gold hover:text-gold"
        >
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}
