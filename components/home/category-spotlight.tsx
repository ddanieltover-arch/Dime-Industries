// components/home/category-spotlight.tsx
import Image from "next/image";
import Link from "next/link";

const TILES = [
  {
    href: "/shop/vapes",
    label: "Vapes",
    image: "/brand/category-vapes.svg",
    alt: "DIME vapes",
    kind: "svg" as const,
  },
  {
    href: "/shop/edibles",
    label: "Edibles",
    image: "/brand/category-edibles.svg",
    alt: "DIME edibles",
    kind: "svg" as const,
  },
  {
    href: "/shop/prerolls",
    label: "Prerolls",
    image: "/brand/category-prerolls.svg",
    alt: "DIME prerolls",
    kind: "svg" as const,
  },
  {
    href: "/shop/vapes/live-reserve",
    label: "Live Reserve",
    image: "/brand/peach-icet.png",
    alt: "Live Reserve spotlight",
    kind: "raster" as const,
  },
  {
    href: "/shop/edibles",
    label: "Gummies",
    image: "/brand/gummies.png",
    alt: "Full spectrum gummies",
    kind: "raster" as const,
  },
];

export function CategorySpotlight() {
  return (
    <section aria-labelledby="spotlight-heading" className="bg-[var(--color-bg)] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="spotlight-heading" className="sr-only">
          Shop by category
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {TILES.map((tile) => (
            <li
              key={`${tile.href}-${tile.label}`}
              className="group relative min-h-[320px] overflow-hidden bg-[var(--color-surface)]"
            >
              {tile.kind === "svg" ? (
                // Large brand SVGs — use native img (next/image SVG constraints)
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tile.image}
                  alt={tile.alt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <Image
                  src={tile.image}
                  alt={tile.alt}
                  fill
                  className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6">
                <p className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.1em] text-white">
                  {tile.label}
                </p>
                <Link
                  href={tile.href}
                  className="shrink-0 rounded-full border border-white/60 px-4 py-2 font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-white transition-colors hover:border-[var(--color-resin)] hover:text-[var(--color-resin)]"
                >
                  Learn more
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
