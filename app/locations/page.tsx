// app/locations/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { LOCATION_STATES } from "@/lib/locations/states";

export const metadata: Metadata = {
  title: "Find DIME",
  description: "Locate a neighborhood retailer that stocks DIME Industries products.",
  alternates: { canonical: "/locations" },
};

export default function LocationsPage() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/brand/concrete.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.12em] text-white sm:text-[var(--scale-3xl)]">
            Walk.Run.Drive.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--scale-base)] text-white/75">
            Looking for DIME near you? Browse by state to find neighborhood retailers. Online shop and delivery are
            available in California and Massachusetts.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black transition-colors hover:bg-[var(--color-resin-hover)]"
          >
            Shop online
          </Link>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {LOCATION_STATES.map((state) => (
            <li key={state.slug}>
              <Link
                href={`/locations/${state.slug}`}
                className="block border border-white/20 bg-black/40 p-6 transition-colors hover:border-[var(--color-resin)]"
              >
                <p className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.1em] text-white">
                  {state.name}
                </p>
                <p className="mt-2 text-[var(--scale-sm)] text-white/65">
                  {state.purchasableOnline ? "Shop online + retailers" : "Retailers"}
                </p>
                <span className="mt-4 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                  Learn more
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
