"use client";
import { motion } from "framer-motion";
export function RangoliMotif({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 500 500"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 0.32,
            transition: {
              pathLength: { duration: 2.6, ease: "easeInOut" },
              opacity: { duration: 0.5 },
            },
          },
        }}
      >
        <motion.circle cx="250" cy="250" r="178" />
        <motion.circle cx="250" cy="250" r="122" />
        <motion.path d="M250 72c23 42 61 47 104 37-10 43-5 81 37 104-42 23-47 61-37 104-43-10-81-5-104 37-23-42-61-47-104-37 10-43 5-81-37-104 42-23 47-61 37-104 43 10 81 5 104-37Z" />
        <motion.path d="M250 128c14 26 39 35 68 28-7 29 2 54 28 68-26 14-35 39-28 68-29-7-54 2-68 28-14-26-39-35-68-28 7-29-2-54-28-68 26-14 35-39 28-68 29 7 54-2 68-28Z" />
        <motion.path d="m250 185 65 65-65 65-65-65 65-65Z" />
        <motion.circle cx="250" cy="250" r="12" />
      </motion.g>
    </motion.svg>
  );
}
