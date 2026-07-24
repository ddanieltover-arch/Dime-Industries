// components/catalog/catalog-page.tsx
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { ProductGrid } from "@/components/catalog/product-grid";
import type { CatalogFacetCounts, CatalogFilters as Filters, ProductCardModel } from "@/lib/catalog/types";

type Props = {
  title: string;
  description?: string;
  basePath: string;
  ageVerified: boolean;
  filters: Filters;
  items: ProductCardModel[];
  total: number;
  facets: CatalogFacetCounts;
};

export function CatalogPageShell({
  title,
  description,
  basePath,
  ageVerified,
  filters,
  items,
  total,
  facets,
}: Props) {
  return (
    <>
      <AgeGateDialog initiallyOpen={!ageVerified} />

      {!ageVerified ? null : (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-8 max-w-2xl">
            <h1 className="font-[var(--font-display)] text-[var(--scale-3xl)] leading-tight text-[var(--color-ink)]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 text-[var(--scale-base)] text-[var(--color-ink-soft)]">{description}</p>
            ) : null}
          </header>

          <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
            {/* Desktop facets */}
            <div className="hidden lg:block">
              <CatalogFilters basePath={basePath} filters={filters} facets={facets} />
            </div>

            <div className="space-y-6">
              <CatalogToolbar basePath={basePath} filters={filters} total={total} />

              {/* Mobile facets — details/summary, no card chrome */}
              <details className="lg:hidden">
                <summary className="cursor-pointer list-none font-[var(--font-display)] text-[var(--scale-base)] text-[var(--color-ink)] underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
                  Filters
                </summary>
                <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                  <CatalogFilters basePath={basePath} filters={filters} facets={facets} />
                </div>
              </details>

              <ProductGrid products={items} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
