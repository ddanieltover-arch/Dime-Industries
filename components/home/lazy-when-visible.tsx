// components/home/lazy-when-visible.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Keeps a static SSR shell until the section nears the viewport, then swaps
 * in the interactive client chunk (passed as `active`).
 */
export function LazyWhenVisible({
  fallback,
  active,
  rootMargin = "280px 0px",
}: {
  fallback: ReactNode;
  active: ReactNode;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{show ? active : fallback}</div>;
}
