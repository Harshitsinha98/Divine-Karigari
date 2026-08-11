"use client";

import { motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { slideUp } from "@/lib/motion";

export function Reveal({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & MotionProps) {
  return (
    <motion.div
      className={className}
      variants={slideUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
