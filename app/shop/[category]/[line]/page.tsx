// app/shop/[category]/[line]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import {
  CATALOG_CATEGORIES,
  CATALOG_LINES,
  listProducts,
  parseCatalogSearchParams,
  withCatalogSource,
} from "@/lib/catalog";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { CatalogPageShell } from "@/components/catalog/catalog-page";

type Params = Promise<{ category: string; line: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateStaticParams() {
  const params: { category: string; line: string }[] = [];
  for (const category of CATALOG_CATEGORIES) {
    for (const line of CATALOG_LINES) {
      params.push({ category: category.slug, line: line.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category, line } = await params;
  const cat = CATALOG_CATEGORIES.find((c) => c.slug === category);
  const ln = CATALOG_LINES.find((l) => l.slug === line);
  if (!cat || !ln) return { title: "Shop" };
  return {
    title: `${ln.name} ${cat.name}`,
    description: `Shop the ${ln.name} line of DIME ${cat.name.toLowerCase()}.`,
    alternates: { canonical: `/shop/${cat.slug}/${ln.slug}` },
  };
}

export default async function LinePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { category, line } = await params;
  const cat = CATALOG_CATEGORIES.find((c) => c.slug === category);
  const ln = CATALOG_LINES.find((l) => l.slug === line);
  if (!cat || !ln) notFound();

  const ageGate = await getAgeGateState();
  const sp = await searchParams;
  const filters = {
    ...parseCatalogSearchParams(sp),
    category: cat.slug,
    line: ln.slug,
    jurisdiction: ageGate.jurisdiction,
  };

  const result = ageGate.ageVerified
    ? withCatalogSource(await loadEffectiveCatalog(), () => listProducts(filters))
    : {
        items: [],
        total: 0,
        page: 1,
        pageSize: 24,
        facets: { categories: [], lines: [], strains: [], potencyBands: [], formats: [] },
      };

  return (
    <CatalogPageShell
      title={`${ln.name} · ${cat.name}`}
      description={`${ln.name} products in ${cat.name.toLowerCase()}.`}
      basePath={`/shop/${cat.slug}/${ln.slug}`}
      ageVerified={ageGate.ageVerified}
      filters={filters}
      items={result.items}
      total={result.total}
      facets={result.facets}
    />
  );
}
