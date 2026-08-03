// lib/seo/catalog-indexability.ts — faceted/query catalog URLs should not be indexed
import type { CatalogFilters } from "@/lib/catalog/types";
import { hasActiveCatalogFilters } from "@/components/catalog/active-filter-chips";

/** True when the URL should stay indexed (clean path only). */
export function isCatalogUrlIndexable(filters: CatalogFilters, basePath: string): boolean {
  if (hasActiveCatalogFilters(filters, basePath)) return false;
  if (filters.page != null && filters.page > 1) return false;
  if (filters.pageSize != null && filters.pageSize !== 24) return false;
  if (filters.sort && filters.sort !== "popularity") return false;
  if (filters.minPriceCents != null || filters.maxPriceCents != null) return false;
  return true;
}

export function catalogRobotsForFilters(filters: CatalogFilters, basePath: string) {
  if (isCatalogUrlIndexable(filters, basePath)) {
    return { index: true, follow: true } as const;
  }
  return { index: false, follow: true } as const;
}
