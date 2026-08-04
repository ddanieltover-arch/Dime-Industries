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
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { catalogRobotsForFilters } from "@/lib/seo/catalog-indexability";
import { catalogSeoLinks } from "@/lib/seo/related-posts";

type Params = Promise<{ category: string; line: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const DISPOSABLES_COPY = {
  title: "DIME Disposable & All-in-One Vapes",
  metaDescription:
    "Learn about dime disposable formats and shop DIME carts and all-in-ones. Lab-tested hardware for licensed markets — adults 21+ only.",
  h1: "DIME Disposables & All-in-Ones",
  description:
    "Searching for a dime disposable? DIME focuses on engineered carts and select all-in-ones sold through licensed retailers. Compare formats, then browse Signature, Live Reserve, and Rosin for your jurisdiction.",
  answer:
    "A DIME disposable (all-in-one) is a self-contained vape; a dime cart is a 510 cartridge you pair with a battery. Both use lab-tested DIME hardware — buy only from licensed retailers and validate authenticity.",
} as const;

function linePageCopy(categorySlug: string, lineSlug: string, catName: string, lineName: string) {
  if (lineSlug === "disposables" && categorySlug === "vapes") {
    return DISPOSABLES_COPY;
  }

  if (lineSlug === "rosin") {
    if (categorySlug === "vapes") {
      return {
        title: "DIME Industries Rosin Vapes",
        metaDescription:
          "Shop DIME Industries rosin — solventless-style dime carts and pens on engineered hardware. Lab-tested DIME Rosin cartridges for licensed markets.",
        h1: "DIME Industries Rosin Vapes",
        description:
          "DIME Industries rosin is the solventless-style cart and pen lane: flavor-forward fills on engineered DIME hardware. Filter by strain and potency, read What is DIME Rosin?, and confirm every batch on Lab Results.",
        answer:
          "DIME Rosin targets solventless-style shoppers — separate from Signature distillate and Live Reserve high-terpene extract with melted diamonds. Shop listed Rosin SKUs for your jurisdiction after age verification.",
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

  if (lineSlug === "live-reserve" && categorySlug === "vapes") {
    return {
      title: "DIME Live Reserve Vapes",
      metaDescription:
        "Shop DIME Live Reserve carts and all-in-ones — high-terpene extract with melted diamonds for strain-forward flavor. Lab-tested for licensed markets.",
      h1: "DIME Live Reserve Vapes",
      description:
        "Live Reserve is DIME’s strain-expressive vape line: high-terpene extract with melted diamonds on engineered DIME hardware. Not every “live resin” menu label is the same — shop Live Reserve carts and disposables for your jurisdiction.",
    };
  }

  if (lineSlug === "signature" && categorySlug === "vapes") {
    return {
      title: "DIME Signature Carts & Vapes",
      metaDescription:
        "Shop DIME Signature carts and disposables — potent distillate-forward formulas with terpene enhancement on engineered DIME hardware.",
      h1: "DIME Signature Carts & Vapes",
      description:
        "Signature is DIME’s everyday flagship: potent, flavorful distillate experiences with terpene enhancement. Browse Signature dime carts and all-in-ones, then filter by strain and potency for your market.",
    };
  }

  return {
    title: `${lineName} ${catName}`,
    metaDescription: `Shop the ${lineName} line of DIME ${catName.toLowerCase()}.`,
    h1: `${lineName} · ${catName}`,
    description: `${lineName} products in ${catName.toLowerCase()}.`,
  };
}

function resolveLine(category: string, line: string) {
  const cat = CATALOG_CATEGORIES.find((c) => c.slug === category);
  if (!cat) return null;

  if (category === "vapes" && line === "disposables") {
    return {
      cat,
      ln: { slug: "disposables", name: "Disposables" },
      isSeoLanding: true as const,
    };
  }

  const ln = CATALOG_LINES.find((l) => l.slug === line);
  if (!ln) return null;
  return { cat, ln, isSeoLanding: false as const };
}

export async function generateStaticParams() {
  const params: { category: string; line: string }[] = [];
  for (const category of CATALOG_CATEGORIES) {
    for (const line of CATALOG_LINES) {
      params.push({ category: category.slug, line: line.slug });
    }
  }
  params.push({ category: "vapes", line: "disposables" });
  return params;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { category, line } = await params;
  const resolved = resolveLine(category, line);
  if (!resolved) return { title: "Shop" };
  const { cat, ln } = resolved;
  const copy = linePageCopy(cat.slug, ln.slug, cat.name, ln.name);
  const basePath = `/shop/${cat.slug}/${ln.slug}`;
  const filters = parseCatalogSearchParams(await searchParams);
  return {
    title: copy.title,
    description: copy.metaDescription,
    alternates: { canonical: basePath },
    robots: catalogRobotsForFilters(filters, basePath),
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
  const resolved = resolveLine(category, line);
  if (!resolved) notFound();

  const { cat, ln, isSeoLanding } = resolved;
  const copy = linePageCopy(cat.slug, ln.slug, cat.name, ln.name);
  const basePath = `/shop/${cat.slug}/${ln.slug}`;
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: cat.name, path: `/shop/${cat.slug}` },
    { name: copy.h1, path: basePath },
  ]);

  const ageGate = await getAgeGateState();
  const sp = await searchParams;
  const filters = {
    ...parseCatalogSearchParams(sp),
    category: cat.slug,
    // SEO landing is not a real catalog line — list all vapes instead
    line: isSeoLanding ? undefined : ln.slug,
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
      <JsonLdScript data={breadcrumbs} />
      <CatalogPageShell
        title={copy.h1}
        description={copy.description}
        basePath={basePath}
        ageVerified={ageGate.ageVerified}
        filters={filters}
        items={result.items}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        facets={result.facets}
        seoLinks={catalogSeoLinks(basePath)}
        answer={"answer" in copy ? copy.answer : undefined}
        outboundKey={basePath}
      />
    </>
  );
}
