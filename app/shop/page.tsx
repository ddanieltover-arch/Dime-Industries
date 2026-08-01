// app/shop/page.tsx
import type { Metadata } from "next";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { listProducts, parseCatalogSearchParams } from "@/lib/catalog";
import { withEffectiveCatalog } from "@/lib/catalog/effective";
import { CatalogPageShell } from "@/components/catalog/catalog-page";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse lab-tested vapes, edibles, prerolls, and accessories. Filter by strain, potency, and format.",
  alternates: { canonical: "/shop" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const ageGate = await getAgeGateState();
  const params = await searchParams;
  const filters = {
    ...parseCatalogSearchParams(params),
    jurisdiction: ageGate.jurisdiction,
  };

  const result = ageGate.ageVerified
    ? await withEffectiveCatalog(() => listProducts(filters))
    : { items: [], total: 0, page: 1, pageSize: 24, facets: { categories: [], lines: [], strains: [], potencyBands: [], formats: [] } };

  return (
    <CatalogPageShell
      title="Shop"
      description="Lab-tested vapes, edibles, prerolls, and accessories — filter by strain, potency, and format. Available in California and Massachusetts."
      basePath="/shop"
      ageVerified={ageGate.ageVerified}
      filters={filters}
      items={result.items}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      facets={result.facets}
    />
  );
}
