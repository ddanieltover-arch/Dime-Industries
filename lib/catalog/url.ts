// lib/catalog/url.ts
import type { CatalogFilters } from "@/lib/catalog/types";
import { CATALOG_DEFAULT_PAGE_SIZE } from "@/lib/catalog/types";

/** Build a shareable catalog URL from the current filters + a patch. */
export function buildCatalogHref(
  basePath: string,
  filters: CatalogFilters,
  patch: Partial<CatalogFilters> = {}
): string {
  const next = { ...filters, ...patch };
  const params = new URLSearchParams();

  if (next.strain) params.set("strain", next.strain);
  if (next.potency) params.set("potency", next.potency);
  if (next.format) params.set("format", next.format);
  if (next.line && !basePath.includes(`/${next.line}`)) params.set("line", next.line);
  if (next.q) params.set("q", next.q);
  if (next.sort && next.sort !== "popularity") params.set("sort", next.sort);
  if (next.minPriceCents != null) params.set("minPrice", String(next.minPriceCents));
  if (next.maxPriceCents != null) params.set("maxPrice", String(next.maxPriceCents));
  if (next.page && next.page > 1) params.set("page", String(next.page));
  if (next.pageSize && next.pageSize !== CATALOG_DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(next.pageSize));
  }

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
