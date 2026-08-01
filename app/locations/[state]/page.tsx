// app/locations/[state]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocationState, LOCATION_STATES } from "@/lib/locations/states";

type Params = Promise<{ state: string }>;

export function generateStaticParams() {
  return LOCATION_STATES.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { state: slug } = await params;
  const state = getLocationState(slug);
  if (!state) return { title: "Find DIME" };
  return {
    title: `Find DIME in ${state.name}`,
    description: state.blurb,
    alternates: { canonical: `/locations/${state.slug}` },
  };
}

export default async function LocationStatePage({ params }: { params: Params }) {
  const { state: slug } = await params;
  const state = getLocationState(slug);
  if (!state) notFound();

  const otherStates = LOCATION_STATES.filter((s) => s.slug !== state.slug).slice(0, 6);

  return (
    <>
      <section className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-12 lg:py-16">
          <nav className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            <Link href="/locations" className="transition-colors hover:text-[var(--color-resin)]">
              Find DIME
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-[var(--color-ink)]">{state.name}</span>
          </nav>

          <p className="mt-8 font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            {state.code}
            {state.purchasableOnline ? " · Online + retail" : " · Retailers"}
          </p>
          <h1 className="section-title mt-2">DIME in {state.name}</h1>
          <p className="mt-4 max-w-2xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
            {state.blurb}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {state.purchasableOnline ? (
              <Link href="/shop" className="btn-primary">
                Shop online
              </Link>
            ) : null}
            <Link href="/locations" className="btn-outline">
              All states
            </Link>
          </div>

          {!state.purchasableOnline ? (
            <p className="mt-6 max-w-xl text-[var(--scale-sm)] text-[var(--color-ink-muted)]">
              Online checkout isn&apos;t available in {state.code} yet — visit a licensed retailer near you.
            </p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="retailers-heading" className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Where to go
          </p>
          <h2 id="retailers-heading" className="section-title mt-2">
            Retailers
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Ask for DIME Signature, Live Reserve, edibles, and hardware at authorized shops.
          </p>

          <ul className="mt-10 divide-y divide-[var(--color-border)] border border-[var(--color-border)]" role="list">
            {state.retailers.map((r) => (
              <li
                key={`${r.name}-${r.city}`}
                className="bg-[var(--color-bg)] px-5 py-5 transition-colors duration-[var(--motion-fast)] hover:bg-[var(--color-surface-raised)] sm:px-7"
              >
                <p className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                  {r.name}
                </p>
                <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{r.city}</p>
                {r.note ? (
                  <p className="mt-2 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-muted)]">{r.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="more-states-heading"
        className="border-t border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-12">
          <h2
            id="more-states-heading"
            className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]"
          >
            Other markets
          </h2>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3" role="list">
            {otherStates.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/locations/${s.slug}`}
                  className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-ink)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin)]"
                >
                  {s.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/locations"
                className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-resin)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin-hover)]"
              >
                View all →
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
