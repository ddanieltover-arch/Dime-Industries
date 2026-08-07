// app/shop/page.tsx
import type { Metadata } from "next";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { listProducts, parseCatalogSearchParams } from "@/lib/catalog";
import { withEffectiveCatalog } from "@/lib/catalog/effective";
import { CatalogPageShell } from "@/components/catalog/catalog-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { catalogRobotsForFilters } from "@/lib/seo/catalog-indexability";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { catalogSeoLinks } from "@/lib/seo/related-posts";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);
  return {
    title: "Shop DIME Products",
    description:
      "Shop DIME Industries carts, vape pens, edibles, prerolls, and accessories. Flower formats ship as listed prerolls — no unverified loose-flower SKUs. Licensed markets only.",
    alternates: { canonical: "/shop" },
    robots: catalogRobotsForFilters(filters, "/shop"),
  };
}

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

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
  ]);

  return (
    <>
      <JsonLdScript data={breadcrumbs} />
      <CatalogPageShell
        title="Shop DIME Products"
        description="Browse lab-tested DIME carts, vape pens, edibles, prerolls, and accessories for California and Massachusetts. Looking for DIME flower? Start with prerolls where stocked — we don’t invent loose-flower SKUs."
        answer="Shop DIME Industries for carts and pens, edibles, and preroll flower formats. Filter by strain and potency after age verification, or Find DIME for licensed retailers in other states."
        basePath="/shop"
        ageVerified={ageGate.ageVerified}
        filters={filters}
        items={result.items}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        facets={result.facets}
        seoLinks={catalogSeoLinks("/shop")}
        outboundKey="/shop"
      />
    </>
  );
}
