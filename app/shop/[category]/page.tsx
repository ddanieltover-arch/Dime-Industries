// app/shop/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import {
  CATALOG_CATEGORIES,
  listProducts,
  parseCatalogSearchParams,
} from "@/lib/catalog";
import { withEffectiveCatalog } from "@/lib/catalog/effective";
import { CatalogPageShell } from "@/components/catalog/catalog-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { catalogRobotsForFilters } from "@/lib/seo/catalog-indexability";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { catalogSeoLinks } from "@/lib/seo/related-posts";

type Params = Promise<{ category: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateStaticParams() {
  return CATALOG_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { category } = await params;
  const sp = await searchParams;
  const meta = CATALOG_CATEGORIES.find((c) => c.slug === category);
  if (!meta) return { title: "Shop" };
  const basePath = `/shop/${meta.slug}`;
  const filters = parseCatalogSearchParams(sp);
  const robots = catalogRobotsForFilters(filters, basePath);

  if (meta.slug === "vapes") {
    return {
      title: "DIME Carts & Vapes",
      description:
        "Shop DIME carts and vape cartridges — Signature, Live Reserve, Rosin, and more. Lab-tested dime carts for licensed markets.",
      alternates: { canonical: basePath },
      robots,
    };
  }

  return {
    title: meta.name,
    description: `Shop DIME ${meta.name.toLowerCase()} — filter by strain, potency, and format.`,
    alternates: { canonical: basePath },
    robots,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { category } = await params;
  const meta = CATALOG_CATEGORIES.find((c) => c.slug === category);
  if (!meta) notFound();

  const ageGate = await getAgeGateState();
  const sp = await searchParams;
  const filters = {
    ...parseCatalogSearchParams(sp),
    category: meta.slug,
    jurisdiction: ageGate.jurisdiction,
  };

  const result = ageGate.ageVerified
    ? await withEffectiveCatalog(() => listProducts(filters))
    : {
        items: [],
        total: 0,
        page: 1,
        pageSize: 24,
        facets: { categories: [], lines: [], strains: [], potencyBands: [], formats: [] },
      };

  const title = meta.slug === "vapes" ? "DIME Carts & Vapes" : meta.name;
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: title, path: `/shop/${meta.slug}` },
  ]);

  return (
    <>
      <JsonLdScript data={breadcrumbs} />
      <CatalogPageShell
        title={title}
        description={
          meta.slug === "vapes"
            ? "Shop DIME carts and all-in-one vapes across Signature, Live Reserve, Rosin, and State Exclusive lines. Lab-tested cartridges engineered in-house — browse by strain, potency, and format for your jurisdiction."
            : `Lab-tested ${meta.name.toLowerCase()} available in your selected jurisdiction.`
        }
        answer={
          meta.slug === "vapes"
            ? "DIME carts are lab-tested DIME Industries vape cartridges and all-in-ones — Signature, Live Reserve, Rosin, and more — sold for licensed markets. Filter by strain and potency after age verification."
            : undefined
        }
        basePath={`/shop/${meta.slug}`}
        ageVerified={ageGate.ageVerified}
        filters={filters}
        items={result.items}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        facets={result.facets}
        seoLinks={catalogSeoLinks(`/shop/${meta.slug}`)}
        outboundKey={`/shop/${meta.slug}`}
      />
    </>
  );
}
