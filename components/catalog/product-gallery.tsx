// components/catalog/product-gallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = {
  images: string[];
  productName: string;
  fallbackLabel: string;
};

export function ProductGallery({ images, productName, fallbackLabel }: Props) {
  const [active, setActive] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const current = images[active] ?? null;

  if (!current) {
    return (
      <div className="relative aspect-square overflow-hidden bg-[var(--color-surface)]">
        <div className="flex h-full items-center justify-center font-[var(--font-display)] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          {fallbackLabel}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <figure className="group relative m-0 aspect-square overflow-hidden bg-[var(--color-surface)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={current}
              alt={productName}
              fill
              priority
              className="object-contain p-8 transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
        <figcaption className="sr-only">
          {productName}
          {images.length > 1 ? ` — image ${active + 1} of ${images.length}` : ""}
        </figcaption>
      </figure>

      {images.length > 1 ? (
        <ul className="grid grid-cols-4 gap-2" role="list">
          {images.map((src, index) => {
            const selected = index === active;
            return (
              <li key={`${src}-${index}`}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`View image ${index + 1} of ${images.length}`}
                  aria-pressed={selected}
                  className={`relative aspect-square w-full overflow-hidden bg-[var(--color-surface)] transition-[box-shadow,transform] duration-[var(--motion-fast)] ease-[var(--ease-out)] ${
                    selected
                      ? "ring-2 ring-[var(--color-resin)] ring-offset-2 ring-offset-[var(--color-bg)]"
                      : "hover:ring-1 hover:ring-[var(--color-border-interactive)]"
                  }`}
                >
                  <Image src={src} alt="" fill className="object-contain p-2" sizes="120px" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
