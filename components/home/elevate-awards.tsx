// components/home/elevate-awards.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal, usePrefersReducedMotion } from "@/components/motion";
import { ELEVATE_AWARDS_GALLERY } from "@/components/home/elevate-awards-data";

/** Products first, then medals, then hardware — infinite fade loop. */
const GALLERY = ELEVATE_AWARDS_GALLERY;

const FADE_MS = 900;
const HOLD_MS = 4200;

export function ElevateAwards() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setActive(((index % GALLERY.length) + GALLERY.length) % GALLERY.length);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || paused || GALLERY.length < 2) return;

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % GALLERY.length);
    }, HOLD_MS);

    return () => window.clearInterval(id);
  }, [paused, prefersReducedMotion]);

  return (
    <section aria-labelledby="elevate-heading" className="relative overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Image
          src="/brand/awards-hardware.webp"
          alt=""
          fill
          className="object-cover opacity-25"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="section-eyebrow">Elevate your experience</p>
          <h2 id="elevate-heading" className="section-title mt-3 text-white">
            Award-winning products
          </h2>
          <p className="mt-5 max-w-lg text-[var(--scale-base)] leading-relaxed text-white/75">
            Innovation takes center stage. Our commitment to excellence has earned recognition
            across leading industry publications — shop the lineup that set the bar for potent,
            delicious cannabis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Shop now
            </Link>
            <Link href="/about" className="btn-outline-light">
              Our story
            </Link>
          </div>
        </Reveal>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          <div
            className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/6]"
            role="region"
            aria-roledescription="carousel"
            aria-label="Award-winning products gallery"
            aria-live={prefersReducedMotion || paused ? "polite" : "off"}
          >
            {GALLERY.map((shot, index) => {
              const isActive = index === active;
              return (
                <figure
                  key={shot.src}
                  className="absolute inset-0 m-0"
                  aria-hidden={!isActive}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transition: prefersReducedMotion
                      ? "none"
                      : `opacity ${FADE_MS}ms var(--ease-out)`,
                    zIndex: isActive ? 1 : 0,
                  }}
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <figcaption className="sr-only">{shot.alt}</figcaption>
                </figure>
              );
            })}
          </div>

          <div
            className="mt-4 flex items-center justify-center gap-2"
            role="group"
            aria-label="Gallery slides"
          >
            {GALLERY.map((shot, index) => {
              const selected = index === active;
              return (
                <button
                  key={shot.src}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show image ${index + 1} of ${GALLERY.length}: ${shot.alt}`}
                  aria-current={selected ? "true" : undefined}
                  className="flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-full p-3"
                >
                  <span
                    className={`block rounded-full transition-[width,background-color] duration-[var(--motion-base)] ease-[var(--ease-out)] ${
                      selected
                        ? "h-1.5 w-6 bg-[var(--color-resin)]"
                        : "h-1.5 w-1.5 bg-white/35"
                    }`}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
