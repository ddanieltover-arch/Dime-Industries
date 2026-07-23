// components/home/store-locator-teaser.tsx
import Link from "next/link";

export function StoreLocatorTeaser() {
  return (
    <section
      aria-labelledby="locator-heading"
      className="relative overflow-hidden bg-[var(--color-surface)]"
      style={{
        backgroundImage: "url(/brand/concrete.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
        <h2
          id="locator-heading"
          className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.12em] text-white sm:text-[var(--scale-3xl)]"
        >
          Walk.Run.Drive.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--scale-base)] text-white/75">
          Looking for DIME near you? Browse our map to find a neighborhood retailer that stocks your favorite
          DIME Industries products.
        </p>
        <Link
          href="/locations"
          className="mt-8 inline-block rounded-full border border-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-[var(--color-resin)] transition-colors hover:bg-[var(--color-resin)] hover:text-black"
        >
          Find DIME
        </Link>
      </div>
    </section>
  );
}
