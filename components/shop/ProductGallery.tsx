"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);

  const next = () => setSelected((s) => (s + 1) % images.length);
  const prev = () => setSelected((s) => (s - 1 + images.length) % images.length);

  return (
    <div className="grid gap-4 sm:grid-cols-[80px_1fr]">
      {/* Thumbnails */}
      <div className="order-2 flex gap-2.5 overflow-x-auto sm:order-1 sm:grid sm:content-start sm:gap-3">
        {images.map((image, index) => (
          <button
            key={image}
            onClick={() => setSelected(index)}
            className={`relative aspect-square min-w-[72px] overflow-hidden rounded-soft-lg border-2 transition-all duration-300 ${
              selected === index
                ? "border-gold shadow-glow"
                : "border-transparent hover:border-sand-line"
            }`}
          >
            <Image
              src={image}
              alt={`${name} thumbnail ${index + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative order-1 aspect-square overflow-hidden rounded-soft-2xl bg-cream sm:order-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative h-full w-full"
          >
            <Image
              src={images[selected]}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/70 p-2 shadow-soft backdrop-blur-sm transition-all hover:bg-white hover:shadow-lift"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/70 p-2 shadow-soft backdrop-blur-sm transition-all hover:bg-white hover:shadow-lift"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Zoom button */}
        <button
          onClick={() => setZoom(true)}
          aria-label={`Zoom ${name}`}
          className="absolute bottom-4 right-4 rounded-full border border-white/30 bg-white/80 p-3 shadow-soft backdrop-blur-sm transition-all hover:bg-white hover:shadow-lift hover:text-gold"
        >
          <ZoomIn size={18} />
        </button>

        {/* Image dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === selected ? "w-6 bg-gold" : "w-1.5 bg-ink/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-5 backdrop-blur-sm"
            role="dialog"
            aria-label={`${name} enlarged image`}
            onClick={() => setZoom(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative h-full w-full max-w-4xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={images[selected]}
                alt={name}
                fill
                sizes="90vw"
                className="object-contain"
              />
              <button
                onClick={() => setZoom(false)}
                aria-label="Close image"
                className="absolute right-2 top-2 rounded-full bg-parchment p-2.5 text-ink shadow-lift transition-all hover:bg-white"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
