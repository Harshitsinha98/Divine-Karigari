"use client";

import { motion } from "framer-motion";

/**
 * Full-page loading spinner with the DK logo animation.
 * Use this as a loading.tsx or Suspense fallback.
 */
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-parchment">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative"
        >
          {/* Spinning outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="h-20 w-20 rounded-full border-2 border-gold/20"
          >
            <div className="absolute left-0 top-0 h-20 w-20 rounded-full border-2 border-transparent border-t-gold" />
          </motion.div>

          {/* Center DK text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-display text-2xl italic text-gradient-gold"
            >
              dk
            </motion.span>
          </div>
        </motion.div>

        {/* Brand name with shimmer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <p className="font-display text-lg tracking-wide text-ink">
            Divine <span className="text-gradient-gold">Karigari</span>
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 0.8, duration: 2, repeat: Infinity }}
            className="mt-2 text-xs text-muted-ink"
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Inline section loader (non-fullscreen).
 * Use inside a page for loading states.
 */
export function SectionLoader({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-full border-2 border-sand-line"
          >
            <div className="absolute left-0 top-0 h-12 w-12 rounded-full border-2 border-transparent border-t-gold" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-sm italic text-gold">dk</span>
          </div>
        </div>
        {message && (
          <p className="text-sm text-muted-ink">{message}</p>
        )}
      </div>
    </div>
  );
}
