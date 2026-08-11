"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeIn, fadeInUp, staggerChildren, blurIn } from "@/lib/motion";

export function HeroIntro({ children }: { children: ReactNode }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerChildren}>
      {children}
    </motion.div>
  );
}

export function HeroEyebrow({ children }: { children: ReactNode }) {
  return <motion.p variants={fadeIn}>{children}</motion.p>;
}

export function HeroHeading({ children }: { children: ReactNode }) {
  return <motion.h1 variants={blurIn}>{children}</motion.h1>;
}

export function HeroCopy({ children }: { children: ReactNode }) {
  return <motion.div variants={fadeInUp}>{children}</motion.div>;
}

/** Floating decorative orbs for hero background */
export function HeroOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Large warm gradient orb */}
      <motion.div
        className="absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-gradient-radial from-gold/20 via-gold/5 to-transparent blur-3xl sm:h-[700px] sm:w-[700px]"
        animate={{
          y: [-10, 15, -10],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Small accent orb */}
      <motion.div
        className="absolute -left-10 bottom-20 h-[300px] w-[300px] rounded-full bg-gradient-radial from-oxblood/10 via-oxblood/3 to-transparent blur-3xl sm:h-[400px] sm:w-[400px]"
        animate={{
          y: [10, -12, 10],
          x: [-5, 5, -5],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Subtle floating particle */}
      <motion.div
        className="absolute left-1/3 top-1/4 h-2 w-2 rounded-full bg-gold/40"
        animate={{
          y: [-20, 20, -20],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-1/4 top-2/3 h-1.5 w-1.5 rounded-full bg-gold/30"
        animate={{
          y: [15, -15, 15],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute left-2/3 top-1/3 h-1 w-1 rounded-full bg-oxblood/30"
        animate={{
          y: [-10, 10, -10],
          x: [5, -5, 5],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}

/** Animated badge/pill for hero section */
export function HeroBadge({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={fadeIn}
      className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 backdrop-blur-sm"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
      </span>
      {children}
    </motion.div>
  );
}
