// components/home/category-spotlight-static.tsx
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_SPOTLIGHT_TILES } from "@/components/home/category-spotlight-data";

/** SSR / pre-hydrate shell — CSS scroll-snap only, no carousel JS. */
export function CategorySpotlightStatic() {
  return (
    <section aria-labelledby="categories-heading" className="section-pad border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-[var(--container-pad-x)]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">Shop</p>
            <h2 id="categories-heading" className="section-title mt-2">
              Shop by category
            </h2>
          </div>
          <Link href="/shop" className="btn-outline">
            View all
          </Link>
        </div>
      </div>

      <div
        className="rail-scroll overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x proximity" }}
        role="region"
        aria-label="Shop by category"
      >
        <div
          className="flex w-max gap-3"
          style={{
            paddingInline:
              "max(var(--container-pad-x), calc((100vw - 80rem) / 2 + var(--container-pad-x)))",
          }}
        >
          {CATEGORY_SPOTLIGHT_TILES.map((tile) => (
            <article
              key={tile.label}
              className="group relative h-full min-h-[260px] w-[min(85vw,22rem)] shrink-0 overflow-hidden bg-[var(--color-surface)] sm:min-h-[340px] sm:w-[min(48vw,24rem)] lg:w-[min(32vw,26rem)]"
              style={{ scrollSnapAlign: "start" }}
            >
              <Link href={tile.href} className="absolute inset-0 z-10" aria-label={`Shop ${tile.label}`}>
                <span className="sr-only">Shop {tile.label}</span>
              </Link>
              <figure className="absolute inset-0 m-0">
                <Image
                  src={tile.image}
                  alt={tile.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 32vw"
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
          ))}
        </div>
      </div>
    </section>
  );
}
