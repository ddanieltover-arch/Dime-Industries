// components/catalog/catalog-filters.tsx
import Link from "next/link";
import type { CatalogFacetCounts, CatalogFilters } from "@/lib/catalog/types";

type Props = {
  basePath: string;
  filters: CatalogFilters;
  facets: CatalogFacetCounts;
};

function hrefFor(basePath: string, filters: CatalogFilters, patch: Partial<CatalogFilters>) {
  const next = { ...filters, ...patch, page: 1 };
  const params = new URLSearchParams();
  if (next.strain) params.set("strain", next.strain);
  if (next.potency) params.set("potency", next.potency);
  if (next.format) params.set("format", next.format);
  if (next.line && !basePath.includes(next.line)) params.set("line", next.line);
  if (next.q) params.set("q", next.q);
  if (next.sort && next.sort !== "popularity") params.set("sort", next.sort);
  if (next.minPriceCents != null) params.set("minPrice", String(next.minPriceCents));
  if (next.maxPriceCents != null) params.set("maxPrice", String(next.maxPriceCents));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

const STRAIN_LABEL: Record<string, string> = {
  sativa: "Sativa",
  indica: "Indica",
  hybrid: "Hybrid",
  na: "N/A",
};

const POTENCY_LABEL: Record<string, string> = {
  low: "Low (<50%)",
  high: "High (50–80%)",
  "very-high": "Very High (>80%)",
};

function FacetLink({
  href,
  active,
  children,
  count,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-[var(--radius-sm)] px-2 py-1.5 text-[var(--scale-sm)] transition-colors ${
        active
          ? "bg-[var(--color-resin-strong)] text-[var(--color-surface)]"
          : "text-[var(--color-ink-soft)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
      }`}
      aria-current={active ? "true" : undefined}
    >
      <span>{children}</span>
      {typeof count === "number" ? (
        <span className="font-[var(--font-mono)] text-[var(--scale-xs)] opacity-80">{count}</span>
      ) : null}
    </Link>
  );
}

export function CatalogFilters({ basePath, filters, facets }: Props) {
  return (
    <aside aria-label="Product filters" className="space-y-8">
      <div>
        <h2 className="font-[var(--font-display)] text-[var(--scale-base)] text-[var(--color-ink)]">
          Strain
        </h2>
        <ul className="mt-2 space-y-1" role="list">
          <li>
            <FacetLink href={hrefFor(basePath, filters, { strain: undefined })} active={!filters.strain}>
              All
            </FacetLink>
          </li>
          {facets.strains
            .filter((s) => s.value !== "na")
            .map((s) => (
              <li key={s.value}>
                <FacetLink
                  href={hrefFor(basePath, filters, { strain: s.value })}
                  active={filters.strain === s.value}
                  count={s.count}
                >
                  {STRAIN_LABEL[s.value] ?? s.value}
                </FacetLink>
              </li>
            ))}
        </ul>
      </div>

      <div>
        <h2 className="font-[var(--font-display)] text-[var(--scale-base)] text-[var(--color-ink)]">
          Potency
        </h2>
        <ul className="mt-2 space-y-1" role="list">
          <li>
            <FacetLink href={hrefFor(basePath, filters, { potency: undefined })} active={!filters.potency}>
              All
            </FacetLink>
          </li>
          {facets.potencyBands.map((b) => (
            <li key={b.value}>
              <FacetLink
                href={hrefFor(basePath, filters, { potency: b.value })}
                active={filters.potency === b.value}
                count={b.count}
              >
                {POTENCY_LABEL[b.value] ?? b.value}
              </FacetLink>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-[var(--font-display)] text-[var(--scale-base)] text-[var(--color-ink)]">
          Format
        </h2>
        <ul className="mt-2 space-y-1" role="list">
          <li>
            <FacetLink href={hrefFor(basePath, filters, { format: undefined })} active={!filters.format}>
              All
            </FacetLink>
          </li>
          {facets.formats.map((f) => (
            <li key={f.value}>
              <FacetLink
                href={hrefFor(basePath, filters, { format: f.value })}
                active={filters.format === f.value}
                count={f.count}
              >
                {f.value}
              </FacetLink>
            </li>
          ))}
        </ul>
      </div>

      {facets.lines.length > 0 ? (
        <div>
          <h2 className="font-[var(--font-display)] text-[var(--scale-base)] text-[var(--color-ink)]">
            Line
          </h2>
          <ul className="mt-2 space-y-1" role="list">
            <li>
              <FacetLink href={hrefFor(basePath, filters, { line: undefined })} active={!filters.line}>
                All
              </FacetLink>
            </li>
            {facets.lines.map((l) => (
              <li key={l.slug}>
                <FacetLink
                  href={hrefFor(basePath, filters, { line: l.slug })}
                  active={filters.line === l.slug}
                  count={l.count}
                >
                  {l.name}
                </FacetLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {(filters.strain || filters.potency || filters.format || filters.line || filters.q) && (
        <Link
          href={basePath}
          className="inline-block text-[var(--scale-sm)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
        >
          Clear all filters
        </Link>
      )}
    </aside>
  );
}
