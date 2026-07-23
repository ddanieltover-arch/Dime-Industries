// components/home/store-locator-teaser.tsx
import Link from "next/link";

export function StoreLocatorTeaser() {
  return (
    <section
      aria-labelledby="locator-heading"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-10">
        <p className="font-[var(--font-mono)] text-[var(--scale-xs)] uppercase tracking-[0.2em] text-[var(--color-terp)]">
          Find DIME near you
        </p>
        <h2 id="locator-heading" className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Retail and delivery across California and Massachusetts
        </h2>
        <p className="mt-2 max-w-xl text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Search by ZIP code to see licensed retailers and delivery zones near you.
        </p>
        <Link
          href="/locations"
          className="mt-6 inline-block rounded-[var(--radius-sm)] border border-[var(--color-border)] px-6 py-3 text-[var(--scale-sm)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-raised)]"
        >
          Find a location
        </Link>
      </div>
    </section>
  );
}
