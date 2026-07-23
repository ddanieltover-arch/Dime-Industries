// components/home/hero-video.tsx
"use client";

import { useReducedMotion } from "framer-motion";
import Link from "next/link";

export function HeroVideo() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section aria-label="Introduction" className="relative isolate min-h-[78vh] w-full overflow-hidden bg-black">
      {prefersReducedMotion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/hero-poster.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/brand/hero.mp4" type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20" />

      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <p className="font-[var(--font-script)] text-[var(--scale-xl)] text-[var(--color-resin)] sm:text-[var(--scale-2xl)]">
          Elevate your experience
        </p>
        <h1 className="mt-2 max-w-2xl font-[var(--font-display)] text-[var(--scale-2xl)] uppercase leading-[1.05] tracking-[0.04em] text-white sm:text-[var(--scale-3xl)]">
          Award-winning products
        </h1>
        <p className="mt-4 max-w-xl text-[var(--scale-base)] text-white/80">
          Explore our products to see why we&apos;re award winning.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black transition-colors hover:bg-[var(--color-resin-hover)]"
          >
            Learn more
          </Link>
          <Link
            href="/shop/vapes"
            className="rounded-full border border-white/50 px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-white transition-colors hover:border-[var(--color-resin)] hover:text-[var(--color-resin)]"
          >
            Shop vapes
          </Link>
        </div>
      </div>
    </section>
  );
}
