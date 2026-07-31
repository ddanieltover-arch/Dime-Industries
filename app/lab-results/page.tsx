// app/lab-results/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { primaryVariant } from "@/lib/catalog";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { fetchCoaBySku } from "@/lib/integrations/coa/client";
import { formatPct } from "@/lib/format";

export const metadata: Metadata = {
  title: "Lab Results",
  description: "Look up certificates of analysis for DIME products by SKU.",
  alternates: { canonical: "/lab-results" },
};

type SearchParams = Promise<{ sku?: string; q?: string }>;

export default async function LabResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const skuQuery = (sp.sku || sp.q || "").trim().toUpperCase();
  const catalog = await loadEffectiveCatalog();

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
    ? await fetchCoaBySku(primary.sku, matches[0]?.coaUrl, matches[0]?.name)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
        Lab Results
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--scale-base)] text-[var(--color-ink-soft)]">
        Search by SKU or product name. Live lab host records appear when configured; otherwise catalog batch metadata is
        shown.
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
          className="flex-1 rounded-full border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-5 py-3 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
        <button
          type="submit"
          className="rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black hover:bg-[var(--color-resin-hover)]"
        >
          Search
        </button>
      </form>

      {coa && matches[0] && primary ? (
        <section className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface)] p-6" aria-label="COA result">
          <p className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-resin)]">
            {coa.source === "live" ? "Live lab host" : "Catalog batch record"}
          </p>
          <h2 className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
            {matches[0].name}
          </h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-[var(--scale-sm)]">
            <div>
              <dt className="text-[var(--color-ink-soft)]">SKU</dt>
              <dd className="text-[var(--color-ink)]">{primary.sku}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-ink-soft)]">THC</dt>
              <dd className="text-[var(--color-ink)]">{formatPct(coa.thcPct ?? primary.thcPct)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-ink-soft)]">CBD</dt>
              <dd className="text-[var(--color-ink)]">{formatPct(coa.cbdPct ?? primary.cbdPct)}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={`/product/${matches[0].slug}`}
              className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-resin)] hover:underline"
            >
              View product
            </Link>
            {coa.documentUrl && !coa.documentUrl.startsWith("/lab-results") ? (
              <a
                href={coa.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] hover:text-[var(--color-resin)]"
              >
                Open document
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mt-12" aria-labelledby="results-heading">
        <h2
          id="results-heading"
          className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.14em] text-[var(--color-resin)]"
        >
          {skuQuery ? "Matches" : "Featured vapes"}
        </h2>
        <ul className="mt-4 divide-y divide-[var(--color-border)] border border-[var(--color-border)]" role="list">
          {matches.map((p) => {
            const v = primaryVariant(p);
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-[var(--font-display)] uppercase tracking-[0.04em] text-[var(--color-ink)]">
                    {p.name}
                  </p>
                  <p className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                    {v.sku} · THC {formatPct(v.thcPct)}
                  </p>
                </div>
                <Link
                  href={`/lab-results?sku=${encodeURIComponent(v.sku)}`}
                  className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]"
                >
                  View COA
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
