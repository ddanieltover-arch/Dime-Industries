// components/catalog/catalog-toolbar.tsx
import Link from "next/link";
import type { CatalogFilters, CatalogSort } from "@/lib/catalog/types";

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "popularity", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "potency-desc", label: "Potency: High to Low" },
  { value: "potency-asc", label: "Potency: Low to High" },
  { value: "name-asc", label: "Name" },
];

type Props = {
  basePath: string;
  filters: CatalogFilters;
  total: number;
};

function buildAction(basePath: string, filters: CatalogFilters) {
  // Form GET keeps URL shareable; hidden fields preserve facets.
  return { action: basePath, filters };
}

export function CatalogToolbar({ basePath, filters, total }: Props) {
  const { action } = buildAction(basePath, filters);

  return (
    <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
      <p className="font-[var(--font-mono)] text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Showing <span className="text-[var(--color-ink)]">{total}</span>{" "}
        {total === 1 ? "result" : "results"}
      </p>

      <form method="get" action={action} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {filters.strain ? <input type="hidden" name="strain" value={filters.strain} /> : null}
        {filters.potency ? <input type="hidden" name="potency" value={filters.potency} /> : null}
        {filters.format ? <input type="hidden" name="format" value={filters.format} /> : null}
        {filters.line ? <input type="hidden" name="line" value={filters.line} /> : null}

        <label className="flex flex-col gap-1 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Search
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Strain, line, SKU…"
            className="min-w-[12rem] rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Sort
          <select
            name="sort"
            defaultValue={filters.sort ?? "popularity"}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-2 text-[var(--scale-sm)] text-[var(--color-surface)] transition-colors hover:bg-[var(--color-resin-hover)]"
        >
          Apply
        </button>

        {filters.q ? (
          <Link
            href={basePath}
            className="text-center text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
          >
            Reset search
          </Link>
        ) : null}
      </form>
    </div>
  );
}
