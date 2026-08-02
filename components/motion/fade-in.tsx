// components/motion/fade-in.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/** Mount-time entrance — for hero copy and above-the-fold elements. */
export function FadeIn({ children, className, delay = 0, y = 20 }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

type FadeInStaggerProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
};

/** Staggered mount entrance for hero eyebrow → title → body → CTAs. */
export function FadeInStagger({
  children,
  className,
  staggerDelay = 0.08,
}: FadeInStaggerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: staggerDelay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type FadeInItemProps = {
  children: ReactNode;
  className?: string;
};

export function FadeInItem({ children, className }: FadeInItemProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: EASE_OUT },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
