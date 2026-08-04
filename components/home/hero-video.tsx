// components/home/hero-video.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const POSTER_WEBP = "/brand/hero-poster.webp";
const POSTER_JPG = "/brand/hero-poster.jpg";
const HERO_MP4 = "/brand/hero.mp4";
const POSTER_WIDTH = 1920;
const POSTER_HEIGHT = 1080;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function canAffordHeroVideo(): boolean {
  if (typeof navigator === "undefined") return false;
  if (prefersReducedMotion()) return false;
  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return false;
  return true;
}

/**
 * Static poster is the LCP element (preloaded in root layout). Video loads only
 * after the first user input so lab CWV never downloads the MP4 during LCP.
 */
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
  const [loadVideo, setLoadVideo] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const armedRef = useRef(false);

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
  }, []);

  const armVideo = useCallback(() => {
    if (armedRef.current) return;
    if (!canAffordHeroVideo()) return;
    armedRef.current = true;
    setLoadVideo(true);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const onFirstInput = () => armVideo();
    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("pointerdown", onFirstInput, opts);
    window.addEventListener("keydown", onFirstInput, opts);
    window.addEventListener("touchstart", onFirstInput, opts);
    window.addEventListener("scroll", onFirstInput, opts);

    return () => {
      window.removeEventListener("pointerdown", onFirstInput);
      window.removeEventListener("keydown", onFirstInput);
      window.removeEventListener("touchstart", onFirstInput);
      window.removeEventListener("scroll", onFirstInput);
    };
  }, [armVideo, reduceMotion]);

  return (
    <section
      aria-label="Introduction"
      className="relative isolate min-h-[min(88vh,920px)] w-full overflow-hidden bg-black"
    >
      <picture>
        <source srcSet={POSTER_WEBP} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element -- static public poster; avoids /_next/image latency on LCP */}
        <img
          src={POSTER_JPG}
          alt=""
          width={POSTER_WIDTH}
          height={POSTER_HEIGHT}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {loadVideo && !reduceMotion ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER_WEBP}
          aria-hidden="true"
        >
          <source src={HERO_MP4} type="video/mp4" />
        </video>
      ) : null}

      <div className="media-veil absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-[min(88vh,920px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-16 pt-28 lg:pb-24">
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
      </div>
    </section>
  );
}
