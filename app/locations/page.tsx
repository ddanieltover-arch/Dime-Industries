// app/locations/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { LOCATION_STATES } from "@/lib/locations/states";

export const metadata: Metadata = {
  title: "Find DIME Near Me",
  description:
    "Find DIME Industries carts, vapes, and edibles near you — locate licensed retailers by state or shop online where available.",
  alternates: { canonical: "/locations" },
};

const ONLINE_STATES = LOCATION_STATES.filter((s) => s.purchasableOnline);
const RETAIL_STATES = LOCATION_STATES.filter((s) => !s.purchasableOnline);

export default function LocationsPage() {
  return (
    <>
      <section className="relative isolate min-h-[min(72vh,640px)] overflow-hidden">
        <Image
          src="/brand/concrete.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="media-veil absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(201,177,56,0.14),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(72vh,640px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-14 pt-28 sm:pb-20 sm:pt-32">
          <p className="section-eyebrow rise">DIME</p>
          <h1 className="rise rise-delay-1 mt-2 max-w-2xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[0.95] tracking-[0.08em] text-white">
            Walk.Run.Drive.
          </h1>
          <p className="rise rise-delay-2 mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80">
            Find a neighborhood retailer that stocks DIME — or shop online for delivery in California and
            Massachusetts.
          </p>
          <div className="rise rise-delay-3 mt-8 flex flex-wrap gap-3">
            <a href="#states" className="btn-primary">
              Browse by state
            </a>
            <Link href="/shop" className="btn-outline-light">
              Shop online
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="online-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <Reveal>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Delivery
            </p>
            <h2 id="online-heading" className="section-title mt-2">
              Shop online
            </h2>
            <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Licensed online checkout ships where we&apos;re set up for delivery.
            </p>
          </Reveal>

          <Stagger as="ul" className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-2" role="list">
            {ONLINE_STATES.map((state) => (
              <StaggerItem key={state.slug} as="li" className="bg-[var(--color-bg)] p-6 sm:p-8">
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                  {state.code} · Online + retail
                </p>
                <h3 className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                  {state.name}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                  {state.blurb}
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href="/shop"
                    className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin-hover)]"
                  >
                    Shop now →
                  </Link>
                  <Link
                    href={`/locations/${state.slug}`}
                    className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin)]"
                  >
                    Retailers →
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section
        id="states"
        aria-labelledby="states-heading"
        className="scroll-mt-24 bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <Reveal>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Find DIME
            </p>
            <h2 id="states-heading" className="section-title mt-2">
              Browse by state
            </h2>
            <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Pick your market to see retailer notes and local availability.
            </p>
          </Reveal>

          <Stagger as="ul" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {LOCATION_STATES.map((state) => (
              <StaggerItem key={state.slug} as="li">
                <Link
                  href={`/locations/${state.slug}`}
                  className="group flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_0_0_transparent] transition-[border-color,background-color,transform,box-shadow] duration-[var(--motion-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-[var(--color-resin)] hover:bg-[var(--color-surface-raised)] hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-resin)]">
                      {state.name}
                    </h3>
                    <span className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                      {state.code}
                    </span>
                  </div>
                  <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                    {state.purchasableOnline ? "Shop online + retailers" : "Retailers"}
                  </p>
                  <span className="mt-auto pt-5 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                    View locations →
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          {RETAIL_STATES.length > 0 ? (
            <p className="mt-8 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
              {RETAIL_STATES.length} markets are retail-only today — online checkout expands as licenses allow.
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <Reveal className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-[var(--container-pad-x)] py-12 sm:flex-row sm:items-center">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Authenticity
            </p>
            <p className="mt-2 max-w-xl font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Validate every product you buy
            </p>
          </div>
          <Link href="/validate" className="btn-primary shrink-0">
            Validate
          </Link>
        </Reveal>
      </section>
    </>
  );
}
