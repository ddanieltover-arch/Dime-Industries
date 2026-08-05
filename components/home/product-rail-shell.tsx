// components/home/product-rail-shell.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal, Stagger } from "@/components/motion";

type Props = {
  headingId: string;
  eyebrow: string;
  title: string;
  description?: string;
  viewAllHref: string;
  viewAllLabel?: string;
  children: ReactNode;
};

/**
 * Shared homepage product rail chrome — edge-bleed horizontal scroll on mobile
 * so the next card peeks, with safe padding and a fade hint.
 */
export function ProductRailShell({
  headingId,
  eyebrow,
  title,
  description,
  viewAllHref,
  viewAllLabel = "View all",
  children,
}: Props) {
  return (
    <section aria-labelledby={headingId} className="section-pad border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-[var(--container-pad-x)]">
        <Reveal className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div className="min-w-0">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              {eyebrow}
            </p>
            <h2 id={headingId} className="section-title mt-2">
              {title}
            </h2>
            {description ? (
              <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                {description}
              </p>
            ) : null}
          </div>
          <Link
            href={viewAllHref}
            className="nav-link inline-flex min-h-11 shrink-0 items-center touch-manipulation text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
          >
            {viewAllLabel}
          </Link>
        </Reveal>
      </div>

      <div className="relative">
        <div className="rail-scroll overflow-x-auto overscroll-x-contain pb-4 [-webkit-overflow-scrolling:touch]">
          <Stagger
            as="ul"
            role="list"
            className="mx-auto flex w-max max-w-none gap-3 px-[var(--container-pad-x)] sm:gap-4 lg:px-[max(var(--container-pad-x),calc((100vw-80rem)/2+var(--container-pad-x)))]"
          >
            {children}
          </Stagger>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--color-bg)] to-transparent sm:w-14"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
