// components/motion/stagger.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
  /** Stagger step in seconds (API compatible with prior Framer usage). */
  staggerDelay?: number;
  role?: string;
};

/**
 * Parent observer — children (`StaggerItem`) animate in with CSS delays.
 */
export function Stagger({
  children,
  className = "",
  as = "div",
  staggerDelay = 0.06,
  role,
}: StaggerProps) {
  const ref = useRef<HTMLElement | null>(null);
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
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  const style = {
    ["--stagger-step" as string]: `${Math.round(staggerDelay * 1000)}ms`,
  } as CSSProperties;

  const classes = `dime-stagger ${visible || reduced ? "dime-stagger--in" : ""} ${className}`;
  const setRef = (node: HTMLElement | null) => {
    ref.current = node;
  };

  if (as === "ul") {
    return (
      <ul ref={setRef} className={classes} role={role} style={style}>
        {children}
      </ul>
    );
  }

  return (
    <div ref={setRef} className={classes} role={role} style={style}>
      {children}
    </div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
};

export function StaggerItem({ children, className = "", as = "div" }: StaggerItemProps) {
  if (as === "li") {
    return <li className={`dime-stagger-item ${className}`}>{children}</li>;
  }
  return <div className={`dime-stagger-item ${className}`}>{children}</div>;
}
