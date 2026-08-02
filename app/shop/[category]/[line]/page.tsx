// app/shop/[category]/[line]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import {
  CATALOG_CATEGORIES,
  CATALOG_LINES,
  listProducts,
  parseCatalogSearchParams,
} from "@/lib/catalog";
import { withEffectiveCatalog } from "@/lib/catalog/effective";
import { CatalogPageShell } from "@/components/catalog/catalog-page";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";

type Params = Promise<{ category: string; line: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function linePageCopy(categorySlug: string, lineSlug: string, catName: string, lineName: string) {
  if (lineSlug === "rosin") {
    if (categorySlug === "vapes") {
      return {
        title: "DIME Industries Rosin Vapes",
        metaDescription:
          "Shop DIME Industries rosin vapes — solventless-style extracts in engineered DIME carts. Lab-tested rosin cartridges for licensed markets.",
        h1: "DIME Industries Rosin Vapes",
        description:
          "Explore the DIME Industries rosin vape line: flavor-forward, lab-tested carts built on DIME hardware. Filter by strain and potency for your jurisdiction.",
      };
    }
    if (categorySlug === "edibles") {
      return {
        title: "DIME Industries Rosin Edibles",
        metaDescription:
          "Shop DIME Industries rosin edibles — live rosin gummies and chews. Lab-tested potency with clear COA paths.",
        h1: "DIME Industries Rosin Edibles",
        description:
          "Browse DIME Industries rosin edibles for solventless-style extracts in gummy and chew formats. Lab-tested and listed for your selected jurisdiction.",
      };
    }
  }

  return {
    title: `${lineName} ${catName}`,
    metaDescription: `Shop the ${lineName} line of DIME ${catName.toLowerCase()}.`,
    h1: `${lineName} · ${catName}`,
    description: `${lineName} products in ${catName.toLowerCase()}.`,
  };
}

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
  const copy = linePageCopy(cat.slug, ln.slug, cat.name, ln.name);
  return {
    title: copy.title,
    description: copy.metaDescription,
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

  const copy = linePageCopy(cat.slug, ln.slug, cat.name, ln.name);
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: cat.name, path: `/shop/${cat.slug}` },
    { name: copy.h1, path: `/shop/${cat.slug}/${ln.slug}` },
  ]);

  const ageGate = await getAgeGateState();
  const sp = await searchParams;
  const filters = {
    ...parseCatalogSearchParams(sp),
    category: cat.slug,
    line: ln.slug,
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

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <CatalogPageShell
        title={copy.h1}
        description={copy.description}
        basePath={`/shop/${cat.slug}/${ln.slug}`}
        ageVerified={ageGate.ageVerified}
        filters={filters}
        items={result.items}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        facets={result.facets}
      />
    </>
  );
}
