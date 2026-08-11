"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { scaleIn, staggerFast } from "@/lib/motion";
import { Heart } from "lucide-react";

const images = [
  ["photo-1513475382585-d06e58bcb0e0", "A small note, beautifully kept"],
  ["photo-1604917877934-07d8d248d396", "Festive details"],
  ["photo-1603006905003-be475563bc59", "Light for the evenings"],
  ["photo-1610701596007-11502861dcfa", "Made for gathering"],
  ["photo-1612902456551-333ac5afa26e", "A little celebration"],
  ["photo-1523779917675-b6ed3a42a561", "Everyday heirlooms"],
];

export function SocialProofGrid() {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      variants={staggerFast}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {images.map(([id, alt]) => (
        <motion.div
          key={id}
          variants={scaleIn}
          className="group relative aspect-square overflow-hidden rounded-soft-2xl"
        >
          <Image
            src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`}
            alt={alt}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]"
          />
          {/* Hover overlay with glass effect */}
          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-all duration-500 group-hover:bg-ink/40">
            <div className="flex translate-y-4 flex-col items-center gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="rounded-full border border-white/30 bg-white/10 p-3 backdrop-blur-sm">
                <Heart size={18} className="text-parchment" />
              </span>
              <span className="text-xs font-medium text-parchment/90">
                {alt}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
