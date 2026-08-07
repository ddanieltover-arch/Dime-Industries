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
      title: "DIME Carts & Vape Pens",
      description:
        "Shop DIME carts and vape pens — lab-tested dime carts, Signature, Live Reserve, Rosin, and all-in-ones for licensed markets. Adults 21+.",
      alternates: { canonical: basePath },
      robots,
    };
  }

  if (meta.slug === "prerolls") {
    return {
      title: "DIME Prerolls (DIMEPACK & Flower Formats)",
      description:
        "Shop DIME prerolls where stocked — DIMEPACK and related flower formats from DIME Industries. No unverified flower SKUs; licensed markets only.",
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

  const title =
    meta.slug === "vapes"
      ? "DIME Carts & Vape Pens"
      : meta.slug === "prerolls"
        ? "DIME Prerolls"
        : meta.name;
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: title, path: `/shop/${meta.slug}` },
  ]);

  const description =
    meta.slug === "vapes"
      ? "Shop dime carts and DIME vape pens across Signature, Live Reserve, Rosin, and State Exclusive — plus all-in-one disposables where listed. Lab-tested cartridges on engineered hardware; filter by strain, potency, and format for your jurisdiction."
      : meta.slug === "prerolls"
        ? "DIME prerolls are the brand’s flower format path (including DIMEPACK styles where stocked). Inventory is market-specific — we don’t list unverified loose-flower SKUs. Confirm availability after age verification or ask a licensed retailer."
        : `Lab-tested ${meta.name.toLowerCase()} available in your selected jurisdiction.`;

  const answer =
    meta.slug === "vapes"
      ? "A dime cart (or DIME vape pen) is a lab-tested DIME Industries cartridge or all-in-one — Signature, Live Reserve, Rosin, and more — sold for licensed markets. Start on the shop filters after age verification, or read the beginner’s guide if you’re new."
      : meta.slug === "prerolls"
        ? "DIME prerolls are licensed flower formats from DIME Industries. Stock rotates by state — browse listed prerolls here or Find DIME for retailers. Loose flower SKUs are not invented on this site until cataloged."
        : undefined;

  return (
    <>
      <JsonLdScript data={breadcrumbs} />
      <CatalogPageShell
        title={title}
        description={description}
        answer={answer}
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
