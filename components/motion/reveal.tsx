// components/motion/reveal.tsx
"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds (API compatible with prior Framer usage). */
  delay?: number;
  /** Vertical offset in px before reveal (default 12). */
  y?: number;
  /** fade-up (default) or fade-only for dense copy. */
  variant?: "fade-up" | "fade";
};

/**
 * Light scroll-in reveal via IntersectionObserver + CSS.
 * Honours prefers-reduced-motion (instant show).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 12,
  variant = "fade-up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  const style: CSSProperties | undefined =
    delay > 0 && visible && !reduced
      ? {
          transitionDelay: `${Math.round(delay * 1000)}ms`,
          ["--reveal-y" as string]: `${y}px`,
        }
      : y !== 12
        ? { ["--reveal-y" as string]: `${y}px` }
        : undefined;

  const variantClass = variant === "fade" ? "dime-reveal--fade" : "";

  return (
    <div
      ref={ref}
      className={`dime-reveal ${variantClass} ${visible || reduced ? "dime-reveal--in" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
