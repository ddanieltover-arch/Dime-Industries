// components/catalog/catalog-page.tsx
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { ActiveFilterChips, hasActiveCatalogFilters } from "@/components/catalog/active-filter-chips";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { applyLiveCoaToCards } from "@/lib/integrations/coa/client";
import type { CatalogFacetCounts, CatalogFilters as Filters, ProductCardModel } from "@/lib/catalog/types";

type Props = {
  title: string;
  description?: string;
  basePath: string;
  ageVerified: boolean;
  filters: Filters;
  items: ProductCardModel[];
  total: number;
  page?: number;
  pageSize?: number;
  facets: CatalogFacetCounts;
};

export async function CatalogPageShell({
  title,
  description,
  basePath,
  ageVerified,
  filters,
  items: rawItems,
  total,
  page = 1,
  pageSize = 24,
  facets,
}: Props) {
  const hasFilters = hasActiveCatalogFilters(filters, basePath);
  const items = ageVerified ? await applyLiveCoaToCards(rawItems) : rawItems;

  return (
    <>
      <AgeGateDialog initiallyOpen={!ageVerified} />

      {!ageVerified ? null : (
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-10 lg:py-14">
          <header className="mb-10 max-w-2xl border-b border-[var(--color-border)] pb-8">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Shop
            </p>
            <h1 className="section-title mt-2">{title}</h1>
            {description ? (
              <p className="mt-3 text-[var(--scale-base)] text-[var(--color-ink-soft)]">{description}</p>
            ) : null}
          </header>

          <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-12">
            <div className="hidden lg:block">
              <CatalogFilters basePath={basePath} filters={filters} facets={facets} />
            </div>

            <div className="space-y-6">
              <CatalogToolbar basePath={basePath} filters={filters} total={total} />

              <ActiveFilterChips basePath={basePath} filters={filters} />

              <details className="border border-[var(--color-border)] lg:hidden">
                <summary className="cursor-pointer list-none px-4 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink)] [&::-webkit-details-marker]:hidden">
                  Filters
                </summary>
                <div className="border-t border-[var(--color-border)] px-4 py-4">
                  <CatalogFilters basePath={basePath} filters={filters} facets={facets} />
                </div>
              </details>

              <ProductGrid products={items} basePath={basePath} hasActiveFilters={hasFilters} />

              <CatalogPagination
                basePath={basePath}
                filters={filters}
                total={total}
                page={page}
                pageSize={pageSize}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
