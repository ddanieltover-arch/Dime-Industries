// components/home/category-spotlight.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "framer-motion";

const TILES = [
  {
    href: "/shop/vapes",
    label: "Vapes",
    image: "/brand/category-vapes.webp",
    alt: "DIME Live Reserve vape",
  },
  {
    href: "/shop/edibles",
    label: "Edibles",
    image: "/brand/category-edibles.webp",
    alt: "DIME peach edibles",
  },
  {
    href: "/shop/prerolls",
    label: "Prerolls",
    image: "/brand/category-prerolls.webp",
    alt: "DIME product lineup",
  },
  {
    href: "/shop/vapes/live-reserve",
    label: "Live Reserve",
    image: "/brand/category-live-reserve.webp",
    alt: "Kushmint Live Reserve",
  },
  {
    href: "/shop/edibles?format=gummies",
    label: "Gummies",
    image: "/brand/category-gummies.webp",
    alt: "Peach Ice T gummies",
  },
  {
    href: "/shop/vapes/rosin",
    label: "Rosin",
    image: "/brand/category-live-reserve.webp",
    alt: "DIME Industries rosin vape cartridge",
  },
];

const GAP_PX = 12;
const AUTO_MS = 4200;
const LOOP_SETS = 3;

type Tile = (typeof TILES)[number];

function CategoryTile({
  tile,
  prefersReducedMotion,
}: {
  tile: Tile;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <article className="group relative h-full min-h-[260px] overflow-hidden bg-[var(--color-surface)] sm:min-h-[340px]">
      <Link href={tile.href} className="absolute inset-0 z-10" aria-label={`Shop ${tile.label}`}>
        <span className="sr-only">Shop {tile.label}</span>
      </Link>

      <figure className="absolute inset-0 m-0">
        <Image
          src={tile.image}
          alt={tile.alt}
          fill
          className={`object-cover transition-transform duration-500 ${
            prefersReducedMotion ? "" : "group-hover:scale-105"
          }`}
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 32vw"
          draggable={false}
        />
        <figcaption className="sr-only">{tile.alt}</figcaption>
      </figure>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 p-6">
        <p className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.12em] text-white">
          {tile.label}
        </p>
        <span className="btn-outline-light pointer-events-none px-4 py-2 text-[10px]">Shop now</span>
      </div>
    </article>
  );
}

export function CategorySpotlight() {
  const prefersReducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(TILES.length);
  const pointerDownRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  /** Suppress only the click synthesized from the current drag gesture. */
  const suppressClickUntilRef = useRef(0);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const loopedTiles = Array.from({ length: LOOP_SETS }, (_, set) =>
    TILES.map((tile, i) => ({ tile, key: `${set}-${tile.label}-${i}` })),
  ).flat();

  const measureStep = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return 0;
    const first = viewport.querySelector<HTMLElement>("[data-carousel-slide]");
    if (!first) return 0;
    return first.offsetWidth + GAP_PX;
  }, []);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const viewport = viewportRef.current;
      const step = measureStep();
      if (!viewport || !step) return;
      indexRef.current = index;
      viewport.scrollTo({ left: index * step, behavior });
      setActive(((index % TILES.length) + TILES.length) % TILES.length);
    },
    [measureStep],
  );

  const normalizeLoop = useCallback(() => {
    const viewport = viewportRef.current;
    const step = measureStep();
    if (!viewport || !step) return;

    const maxIndex = TILES.length * LOOP_SETS - 1;
    let index = Math.round(viewport.scrollLeft / step);

    if (index < TILES.length) {
      index += TILES.length;
      viewport.scrollTo({ left: index * step, behavior: "auto" });
    } else if (index > maxIndex - TILES.length) {
      index -= TILES.length;
      viewport.scrollTo({ left: index * step, behavior: "auto" });
    }

    indexRef.current = index;
    setActive(((index % TILES.length) + TILES.length) % TILES.length);
  }, [measureStep]);

  const go = useCallback(
    (delta: number) => {
      scrollToIndex(indexRef.current + delta, prefersReducedMotion ? "auto" : "smooth");
      window.setTimeout(normalizeLoop, prefersReducedMotion ? 0 : 420);
    },
    [normalizeLoop, prefersReducedMotion, scrollToIndex],
  );

  useLayoutEffect(() => {
    scrollToIndex(TILES.length, "auto");
  }, [scrollToIndex]);

  useEffect(() => {
    const onResize = () => scrollToIndex(indexRef.current, "auto");
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [scrollToIndex]);

  useEffect(() => {
    if (prefersReducedMotion || paused) {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
      return;
    }

    autoTimerRef.current = setInterval(() => {
      if (draggingRef.current) return;
      go(1);
    }, AUTO_MS);

    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [go, paused, prefersReducedMotion]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    // Defer pointer capture until movement exceeds the drag threshold so
    // clicks can still reach category Links (immediate capture was swallowing navigation).
    pointerDownRef.current = true;
    draggingRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = viewport.scrollLeft;
    setPaused(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const dx = e.clientX - dragStartXRef.current;
    if (!draggingRef.current) {
      if (Math.abs(dx) <= 6) return;
      draggingRef.current = true;
      viewport.setPointerCapture(e.pointerId);
    }
    viewport.scrollLeft = dragStartScrollRef.current - dx;
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current) return;
    const viewport = viewportRef.current;
    const didDrag = draggingRef.current;
    pointerDownRef.current = false;
    draggingRef.current = false;
    if (viewport?.hasPointerCapture(e.pointerId)) {
      viewport.releasePointerCapture(e.pointerId);
    }

    if (didDrag) {
      // Block the click that browsers may synthesize from this gesture, then
      // expire so the next intentional tap is not swallowed (esp. on touch).
      suppressClickUntilRef.current = Date.now() + 350;
      const step = measureStep();
      if (viewport && step) {
        const nearest = Math.round(viewport.scrollLeft / step);
        scrollToIndex(nearest, prefersReducedMotion ? "auto" : "smooth");
        window.setTimeout(normalizeLoop, prefersReducedMotion ? 0 : 420);
      }
    }

    setPaused(false);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (Date.now() < suppressClickUntilRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section aria-labelledby="spotlight-heading" className="section-pad bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-[var(--container-pad-x)]">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Explore
            </p>
            <h2 id="spotlight-heading" className="section-title mt-2">
              Shop by category
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/shop" className="nav-link text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]">
              View all products
            </Link>
            <div className="flex items-center gap-2" role="group" aria-label="Category carousel controls">
              <button
                type="button"
                onClick={() => go(-1)}
                className="inline-flex h-11 w-11 touch-manipulation items-center justify-center border border-[var(--color-border-interactive)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-resin)] hover:text-[var(--color-resin)]"
                aria-label="Previous category"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="inline-flex h-11 w-11 touch-manipulation items-center justify-center border border-[var(--color-border-interactive)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-resin)] hover:text-[var(--color-resin)]"
                aria-label="Next category"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
        }}
      >
        <div
          ref={viewportRef}
          className="rail-scroll cursor-grab overflow-x-auto scroll-smooth active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: prefersReducedMotion ? "none" : "x mandatory" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onScroll={() => {
            if (draggingRef.current) return;
            const step = measureStep();
            const viewport = viewportRef.current;
            if (!viewport || !step) return;
            const index = Math.round(viewport.scrollLeft / step);
            indexRef.current = index;
            setActive(((index % TILES.length) + TILES.length) % TILES.length);
          }}
          onClickCapture={onClickCapture}
          role="region"
          aria-roledescription="carousel"
          aria-label="Shop by category"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              go(-1);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              go(1);
            }
          }}
        >
          <div
            ref={trackRef}
            className="flex w-max gap-3"
            style={{
              paddingInline:
                "max(var(--container-pad-x), calc((100vw - 80rem) / 2 + var(--container-pad-x)))",
            }}
          >
            {loopedTiles.map(({ tile, key }) => (
              <div
                key={key}
                data-carousel-slide
                className="w-[min(85vw,22rem)] shrink-0 sm:w-[min(48vw,24rem)] lg:w-[min(32vw,26rem)]"
                style={{ scrollSnapAlign: "start" }}
              >
                <CategoryTile tile={tile} prefersReducedMotion={prefersReducedMotion} />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-7xl justify-center gap-2 px-[var(--container-pad-x)]" aria-label="Category slides">
          {TILES.map((tile, i) => (
            <button
              key={tile.label}
              type="button"
              aria-current={active === i ? "true" : undefined}
              aria-label={`Go to ${tile.label}`}
              onClick={() => {
                const base = Math.floor(indexRef.current / TILES.length) * TILES.length;
                scrollToIndex(base + i, prefersReducedMotion ? "auto" : "smooth");
                window.setTimeout(normalizeLoop, prefersReducedMotion ? 0 : 420);
              }}
              className="flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-full p-3"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  active === i
                    ? "h-1.5 w-8 bg-[var(--color-resin)]"
                    : "h-1.5 w-1.5 bg-[var(--color-border-interactive)]"
                }`}
                aria-hidden
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
