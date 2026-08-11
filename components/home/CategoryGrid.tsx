"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { homepageCategories } from "@/lib/catalog";
import { fadeInUp, staggerChildren } from "@/lib/motion";

export function CategoryGrid() {
  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      variants={staggerChildren}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {homepageCategories.map((category, index) => (
        <motion.div key={category.slug} variants={fadeInUp}>
          <Link
            href={`/shop?category=${category.slug}`}
            className={`group relative block min-h-80 overflow-hidden rounded-soft-2xl ${index === 0 ? "sm:row-span-2 sm:min-h-full" : ""}`}
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]"
            />
            {/* Modern gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent transition-opacity duration-500 group-hover:from-ink/70" />

            {/* Glass info card at bottom */}
            <div className="absolute inset-x-4 bottom-4 rounded-soft-xl border border-white/10 bg-white/10 p-5 backdrop-blur-md transition-all duration-500 group-hover:border-gold/30 group-hover:bg-white/15">
              <p className="font-display text-2xl capitalize text-parchment">
                {category.name}
              </p>
              <p className="mt-1 text-sm text-parchment/70">
                {category.note}
              </p>
              <span className="mt-4 inline-flex rounded-full border border-parchment/30 p-2 transition-all duration-300 group-hover:border-gold group-hover:bg-gold/10 group-hover:text-gold group-hover:shadow-glow">
                <ArrowUpRight size={16} className="text-parchment" />
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
