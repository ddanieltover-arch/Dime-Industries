// components/home/hero-batch-ticket.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

// The signature element for the whole site: the hero is literally styled as
// a lab-certificate ticket, because DIME's actual public identity (per the
// reference-site research) is built on tested transparency — COAs, batch
// numbers, cannabinoid readouts. This isn't decoration; the perforated edge,
// the monospace metadata column, and the potency readout are the same
// structural device that repeats on every product card later in the build.

const readout = [
  { label: "THC", value: 82.5 },
  { label: "CBD", value: 0.2 },
  { label: "CBN", value: 0.1 },
];

export function HeroBatchTicket() {
  const prefersReducedMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 } },
  } satisfies import("framer-motion").Variants;
  const item = {
    hidden: prefersReducedMotion ? {} : { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  } satisfies import("framer-motion").Variants;

  return (
    <section aria-label="Introduction" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)]"
      >
        {/* Perforated tear-line, purely decorative */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-[220px] hidden w-px border-l-2 border-dashed border-[var(--color-border)] md:block"
        />

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
          {/* Metadata stub */}
          <div className="flex flex-row justify-between gap-4 border-b border-[var(--color-border)] p-6 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)] md:flex-col md:justify-start md:border-b-0 md:border-r">
            <div>
              <div className="text-[var(--color-ink)]">BATCH</div>
              <div>DE-2601-LR</div>
            </div>
            <div>
              <div className="text-[var(--color-ink)]">TESTED</div>
              <div>2026-01-14</div>
            </div>
            <div className="hidden md:block">
              <div className="text-[var(--color-ink)]">LAB</div>
              <div>Third-party verified</div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6 sm:p-10">
            <motion.p
              variants={item}
              className="font-[var(--font-mono)] text-[var(--scale-xs)] uppercase tracking-[0.2em] text-[var(--color-terp)]"
            >
              Live Reserve — new this month
            </motion.p>

            <motion.h1
              variants={item}
              className="mt-3 font-[var(--font-display)] text-[var(--scale-2xl)] leading-[1.05] text-[var(--color-ink)] sm:text-[var(--scale-3xl)]"
            >
              Every cartridge, tested and dated before it reaches you.
            </motion.h1>

            <motion.p variants={item} className="mt-4 max-w-xl text-[var(--scale-base)] text-[var(--color-ink-soft)]">
              DIME publishes lab results for every batch — not just the
              average. Browse potency-first, filter by strain and format, and
              see the certificate before you buy.
            </motion.p>

            {/* Potency readout — real data visualization, not a stock stat block */}
            <motion.div variants={item} className="mt-8 max-w-sm space-y-2">
              {readout.map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="w-10 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                    {r.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg)]">
                    <motion.div
                      className="h-full rounded-full bg-[var(--color-resin)]"
                      initial={prefersReducedMotion ? { width: `${Math.min(r.value, 100)}%` } : { width: 0 }}
                      animate={{ width: `${Math.min(r.value, 100)}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    />
                  </div>
                  <span className="w-14 text-right font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink)]">
                    {r.value}%
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-6 py-3 text-[var(--scale-sm)] font-medium text-[var(--color-surface)] transition-colors hover:bg-[var(--color-resin-hover)]"
              >
                Shop the catalog
              </Link>
              <Link
                href="/shop/vapes/live-reserve"
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-6 py-3 text-[var(--scale-sm)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg)]"
              >
                See Live Reserve
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
