// components/home/hero-video.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function HeroVideo({
  eyebrow = "Elevate your experience",
  headline = "Award-winning products",
  body = "Explore our products to see why we're award-winning — lab-tested vapes, edibles, and prerolls.",
  ctaLabel = "Shop now",
  ctaHref = "/shop",
}: {
  eyebrow?: string;
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
} = {}) {
  const prefersReducedMotion = useReducedMotion();

  const copy = (
    <>
      <p className="section-eyebrow text-[clamp(1.75rem,4vw,2.75rem)]">{eyebrow}</p>
      <h1 className="mt-3 max-w-2xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[1.02] tracking-[0.04em] text-white">
        {headline}
      </h1>
      <p className="mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80">{body}</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link href={ctaHref} className="btn-primary">
          {ctaLabel}
        </Link>
        <Link href="/shop/vapes" className="btn-outline-light">
          Shop vapes
        </Link>
      </div>
    </>
  );

  return (
    <section aria-label="Introduction" className="relative isolate min-h-[88vh] w-full overflow-hidden bg-black">
      {prefersReducedMotion ? (
        <picture>
          <source srcSet="/brand/hero-poster.webp" type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/hero-poster.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      ) : (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/hero-poster.webp"
          aria-hidden="true"
        >
          <source src="/brand/hero.mp4" type="video/mp4" />
        </video>
      )}

      <div className="media-veil absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-16 pt-28 lg:pb-24">
        {prefersReducedMotion ? (
          <div>{copy}</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {copy}
          </motion.div>
        )}
      </div>
    </section>
  );
}
