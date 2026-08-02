// components/motion/stagger.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
  staggerDelay?: number;
  role?: string;
};

export function Stagger({
  children,
  className,
  as = "div",
  staggerDelay = 0.06,
  role,
}: StaggerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    if (as === "ul") {
      return (
        <ul className={className} role={role}>
          {children}
        </ul>
      );
    }
    return (
      <div className={className} role={role}>
        {children}
      </div>
    );
  }

  const variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: staggerDelay },
    },
  };

  if (as === "ul") {
    return (
      <motion.ul
        className={className}
        role={role}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={variants}
      >
        {children}
      </motion.ul>
    );
  }

  return (
    <motion.div
      className={className}
      role={role}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
};

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    if (as === "li") {
      return <li className={className}>{children}</li>;
    }
    return <div className={className}>{children}</div>;
  }

  if (as === "li") {
    return (
      <motion.li className={className} variants={itemVariants}>
        {children}
      </motion.li>
    );
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
