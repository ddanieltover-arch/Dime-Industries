// app/locations/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

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
      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.12em] text-white sm:text-[var(--scale-3xl)]">
          Walk.Run.Drive.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--scale-base)] text-white/75">
          Looking for DIME near you? We&apos;re rolling out an interactive store map. Until then, shop online
          for delivery in California and Massachusetts.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black transition-colors hover:bg-[var(--color-resin-hover)]"
          >
            Shop online
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-white/50 px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-white transition-colors hover:border-[var(--color-resin)] hover:text-[var(--color-resin)]"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
