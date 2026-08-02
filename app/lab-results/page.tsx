// app/lab-results/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { primaryVariant, SEED_CATALOG } from "@/lib/catalog";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { fetchCoaBySku } from "@/lib/integrations/coa/client";
import { formatPct } from "@/lib/format";

export const metadata: Metadata = {
  title: "Lab Results",
  description: "Look up certificates of analysis for DIME products by SKU.",
  alternates: { canonical: "/lab-results" },
};

type SearchParams = Promise<{ sku?: string; q?: string }>;

const PILLARS = [
  {
    title: "Third-party tested",
    body: "Every active batch carries potency metadata — THC, CBD, and more — so nothing is a surprise.",
  },
  {
    title: "Search by SKU",
    body: "Look up a product by SKU or name. Live lab host records appear when configured.",
  },
  {
    title: "Catalog fallback",
    body: "If the live host is offline, catalog batch records still show the numbers we publish.",
  },
] as const;

export default async function LabResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const skuQuery = (sp.sku || sp.q || "").trim().toUpperCase();
  const catalog = await loadEffectiveCatalog().catch(() => SEED_CATALOG);

  const matches = skuQuery
    ? catalog
        .filter((p) =>
          p.variants.some(
            (v) =>
              v.sku.toUpperCase() === skuQuery ||
              v.sku.toUpperCase().includes(skuQuery) ||
              p.slug.toUpperCase().includes(skuQuery) ||
              p.name.toUpperCase().includes(skuQuery)
          )
        )
        .slice(0, 12)
    : catalog.filter((p) => p.categorySlug === "vapes").slice(0, 8);

  const primary = matches[0] ? primaryVariant(matches[0]) : null;
  const coa = primary
    ? await fetchCoaBySku(primary.sku, matches[0]?.coaUrl, matches[0]?.name).catch(() => null)
    : null;

  return (
    <>
      <section className="relative isolate min-h-[min(58vh,520px)] overflow-hidden">
        <Image
          src="/brand/awards-medals.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="media-veil absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(201,177,56,0.14),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(58vh,520px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-12 pt-28 sm:pb-16 sm:pt-32">
          <p className="section-eyebrow rise">DIME</p>
          <h1 className="rise rise-delay-1 mt-2 max-w-xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,3.75rem)] uppercase leading-[0.95] tracking-[0.06em] text-white">
            Lab Results
          </h1>
          <p className="rise rise-delay-2 mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80">
            Look up certificates of analysis by SKU or product name — potency you can verify.
          </p>
          <div className="rise rise-delay-3 mt-8 flex flex-wrap gap-3">
            <a href="#lab-search" className="btn-primary">
              Search COAs
            </a>
            <Link href="/validate" className="btn-outline-light">
              Validate product
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="pillars-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Transparency
          </p>
          <h2 id="pillars-heading" className="section-title mt-2">
            Built into every batch
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Lab testing isn&apos;t a marketing claim — it&apos;s how we publish what&apos;s in the product.
          </p>

          <ul className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {PILLARS.map((pillar) => (
              <li key={pillar.title} className="bg-[var(--color-bg)] p-6 sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="lab-search"
        aria-labelledby="search-heading"
        className="scroll-mt-24 border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Lookup
          </p>
          <h2 id="search-heading" className="section-title mt-2">
            Search by SKU
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Live lab host records appear when configured; otherwise catalog batch metadata is shown.
          </p>

          <form className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row" action="/lab-results" method="get">
            <label htmlFor="lab-sku" className="sr-only">
              SKU or product
            </label>
            <input
              id="lab-sku"
              name="sku"
              defaultValue={sp.sku || sp.q || ""}
              placeholder="SKU or product name"
              className="field-input flex-1"
            />
            <button type="submit" className="btn-primary shrink-0">
              Search
            </button>
          </form>

          {coa && matches[0] && primary ? (
            <article
              className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
              aria-label="COA result"
            >
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                {coa.source === "live" ? "Live lab host" : "Catalog batch record"}
              </p>
              <h3 className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                {matches[0].name}
              </h3>
              <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="border-t border-[var(--color-border)] pt-4 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0 first:border-l-0 first:pl-0">
                  <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                    SKU
                  </dt>
                  <dd className="mt-2 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
                    {primary.sku}
                  </dd>
                </div>
                <div className="border-t border-[var(--color-border)] pt-4 sm:border-t-0 sm:border-l sm:border-[var(--color-border)] sm:pl-4 sm:pt-0">
                  <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                    THC
                  </dt>
                  <dd className="mt-2 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-resin)]">
                    {formatPct(coa.thcPct ?? primary.thcPct)}
                  </dd>
                </div>
                <div className="border-t border-[var(--color-border)] pt-4 sm:border-t-0 sm:border-l sm:border-[var(--color-border)] sm:pl-4 sm:pt-0">
                  <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                    CBD
                  </dt>
                  <dd className="mt-2 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
                    {formatPct(coa.cbdPct ?? primary.cbdPct)}
                  </dd>
                </div>
              </dl>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={`/product/${matches[0].slug}`} className="btn-primary">
                  View product
                </Link>
                {coa.documentUrl && !coa.documentUrl.startsWith("/lab-results") ? (
                  <a
                    href={coa.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                  >
                    Open document
                  </a>
                ) : null}
              </div>
            </article>
          ) : skuQuery ? (
            <p className="mt-10 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              No COA match for &ldquo;{skuQuery}&rdquo;. Try another SKU or browse featured vapes below.
            </p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="results-heading" className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            {skuQuery ? "Results" : "Browse"}
          </p>
          <h2 id="results-heading" className="section-title mt-2">
            {skuQuery ? "Matches" : "Featured vapes"}
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            {skuQuery
              ? "Select a match to load its certificate details."
              : "Start with popular vapes — or search any SKU above."}
          </p>

          {matches.length > 0 ? (
            <ul
              className="mt-10 divide-y divide-[var(--color-border)] border border-[var(--color-border)]"
              role="list"
            >
              {matches.map((p) => {
                const v = primaryVariant(p);
                return (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 bg-[var(--color-bg)] px-5 py-4 transition-colors duration-[var(--motion-fast)] hover:bg-[var(--color-surface-raised)] sm:px-7"
                  >
                    <div>
                      <p className="font-[var(--font-display)] uppercase tracking-[0.04em] text-[var(--color-ink)]">
                        {p.name}
                      </p>
                      <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                        {v.sku} · THC {formatPct(v.thcPct)}
                      </p>
                    </div>
                    <Link
                      href={`/lab-results?sku=${encodeURIComponent(v.sku)}`}
                      className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] transition-colors hover:text-[var(--color-resin-hover)]"
                    >
                      View COA →
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-10 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              No products matched that search.
            </p>
          )}
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-[var(--container-pad-x)] py-12 sm:flex-row sm:items-center">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Authenticity
            </p>
            <p className="mt-2 max-w-xl font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Pair lab data with product validation
            </p>
          </div>
          <Link href="/validate" className="btn-primary shrink-0">
            Validate
          </Link>
        </div>
      </section>
    </>
  );
}
