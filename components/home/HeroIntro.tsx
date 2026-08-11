"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeIn, slideUp, staggerChildren } from "@/lib/motion";

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
  return <motion.h1 variants={slideUp}>{children}</motion.h1>;
}

export function HeroCopy({ children }: { children: ReactNode }) {
  return <motion.div variants={slideUp}>{children}</motion.div>;
}
