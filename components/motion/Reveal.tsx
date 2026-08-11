"use client";

import { motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInUp } from "@/lib/motion";

export function Reveal({
  children,
  className,
  delay = 0,
  ...props
}: { children: ReactNode; className?: string; delay?: number } & MotionProps) {
  return (
    <motion.div
      className={className}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
