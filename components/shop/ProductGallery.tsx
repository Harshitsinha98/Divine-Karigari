"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  return (
    <div className="grid gap-3 sm:grid-cols-[76px_1fr]">
      <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:grid sm:content-start">
        <button
          onClick={() => setSelected(0)}
          className={`relative aspect-square min-w-16 overflow-hidden rounded-soft border ${selected === 0 ? "border-gold" : "border-sand-line"}`}
        >
          <Image
            src={images[0]}
            alt={`${name} thumbnail`}
            fill
            sizes="76px"
            className="object-cover"
          />
        </button>
        {images.slice(1).map((image, index) => (
          <button
            key={image}
            onClick={() => setSelected(index + 1)}
            className={`relative aspect-square min-w-16 overflow-hidden rounded-soft border ${selected === index + 1 ? "border-gold" : "border-sand-line"}`}
          >
            <Image
              src={image}
              alt={`${name} thumbnail ${index + 2}`}
              fill
              sizes="76px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
      <div className="relative order-1 aspect-square overflow-hidden rounded-soft-xl bg-sand-line/30 sm:order-2">
        <Image
          src={images[selected]}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
        <button
          onClick={() => setZoom(true)}
          aria-label={`Zoom ${name}`}
          className="absolute bottom-4 right-4 rounded-full bg-parchment/90 p-3 shadow-soft hover:text-gold"
        >
          <ZoomIn size={18} />
        </button>
      </div>
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-5"
          role="dialog"
          aria-label={`${name} enlarged image`}
          onClick={() => setZoom(false)}
        >
          <div
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
              className="absolute right-0 top-0 rounded-full bg-parchment p-2 text-ink"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
