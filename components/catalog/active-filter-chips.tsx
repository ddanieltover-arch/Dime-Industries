// components/catalog/active-filter-chips.tsx
import Link from "next/link";
import type { CatalogFilters } from "@/lib/catalog/types";
import { buildCatalogHref } from "@/lib/catalog/url";

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

type Chip = {
  key: string;
  label: string;
  href: string;
};

export function ActiveFilterChips({
  basePath,
  filters,
}: {
  basePath: string;
  filters: CatalogFilters;
}) {
  const chips: Chip[] = [];

  if (filters.q) {
    chips.push({
      key: "q",
      label: `Search: ${filters.q}`,
      href: buildCatalogHref(basePath, filters, { q: undefined, page: 1 }),
    });
  }
  if (filters.strain) {
    chips.push({
      key: "strain",
      label: STRAIN_LABEL[filters.strain] ?? filters.strain,
      href: buildCatalogHref(basePath, filters, { strain: undefined, page: 1 }),
    });
  }
  if (filters.potency) {
    chips.push({
      key: "potency",
      label: POTENCY_LABEL[filters.potency] ?? filters.potency,
      href: buildCatalogHref(basePath, filters, { potency: undefined, page: 1 }),
    });
  }
  if (filters.format) {
    chips.push({
      key: "format",
      label: filters.format,
      href: buildCatalogHref(basePath, filters, { format: undefined, page: 1 }),
    });
  }
  if (filters.line && !basePath.includes(`/${filters.line}`)) {
    chips.push({
      key: "line",
      label: filters.line.replace(/-/g, " "),
      href: buildCatalogHref(basePath, filters, { line: undefined, page: 1 }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          className="inline-flex items-center gap-2 border border-[var(--color-resin)] bg-[var(--color-surface)] px-3 py-1.5 font-[var(--font-display)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-resin)] transition-colors hover:bg-[var(--color-resin)] hover:text-black"
        >
          <span>{chip.label}</span>
          <span aria-hidden="true">×</span>
          <span className="sr-only">Remove {chip.label} filter</span>
        </Link>
      ))}
      <Link
        href={basePath}
        className="nav-link text-[var(--color-ink-muted)] hover:text-[var(--color-resin)]"
      >
        Clear all
      </Link>
    </div>
  );
}

export function hasActiveCatalogFilters(filters: CatalogFilters, basePath: string): boolean {
  return Boolean(
    filters.q ||
      filters.strain ||
      filters.potency ||
      filters.format ||
      (filters.line && !basePath.includes(`/${filters.line}`))
  );
}
