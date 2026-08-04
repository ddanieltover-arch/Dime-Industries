// components/home/hero-video.tsx
"use client";

import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { FadeInItem, FadeInStagger } from "@/components/motion";

export function HeroVideo({
  eyebrow = "Elevate your experience",
  headline = "Award-winning products",
  body = "Innovation takes center stage. Explore why DIME leads with potent, delicious cannabis — lab-tested vapes, edibles, and prerolls.",
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

  const copy = prefersReducedMotion ? (
    <div>
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
    </div>
  ) : (
    <FadeInStagger>
      <FadeInItem>
        <p className="section-eyebrow text-[clamp(1.75rem,4vw,2.75rem)]">{eyebrow}</p>
      </FadeInItem>
      <FadeInItem>
        <h1 className="mt-3 max-w-2xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[1.02] tracking-[0.04em] text-white">
          {headline}
        </h1>
      </FadeInItem>
      <FadeInItem>
        <p className="mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80">{body}</p>
      </FadeInItem>
      <FadeInItem>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href={ctaHref} className="btn-primary">
            {ctaLabel}
          </Link>
          <Link href="/shop/vapes" className="btn-outline-light">
            Shop vapes
          </Link>
        </div>
      </FadeInItem>
    </FadeInStagger>
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
            fetchPriority="high"
            decoding="async"
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
        {copy}
      </div>
    </section>
  );
}
