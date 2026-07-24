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

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <nav className="mb-6 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        <Link href="/locations" className="hover:text-[var(--color-resin)]">
          Find DIME
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-[var(--color-ink)]">{state.name}</span>
      </nav>

      <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
        DIME in {state.name}
      </h1>
      <p className="mt-4 text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">{state.blurb}</p>

      {state.purchasableOnline ? (
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black hover:bg-[var(--color-resin-hover)]"
        >
          Shop online
        </Link>
      ) : (
        <p className="mt-6 text-[var(--scale-sm)] text-[var(--color-resin)]">
          Online checkout is not available in {state.code} yet — visit a licensed retailer.
        </p>
      )}

      <section className="mt-12" aria-labelledby="retailers-heading">
        <h2
          id="retailers-heading"
          className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.14em] text-[var(--color-resin)]"
        >
          Retailers
        </h2>
        <ul className="mt-4 space-y-3" role="list">
          {state.retailers.map((r) => (
            <li key={`${r.name}-${r.city}`} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="font-[var(--font-display)] uppercase tracking-[0.06em] text-[var(--color-ink)]">{r.name}</p>
              <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{r.city}</p>
              {r.note ? <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{r.note}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
