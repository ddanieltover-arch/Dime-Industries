// components/catalog/catalog-page.tsx
import Link from "next/link";
import { AGE_GATE_ENTRY_ENABLED } from "@/lib/compliance/age-gate-flags";
import { ActiveFilterChips, hasActiveCatalogFilters } from "@/components/catalog/active-filter-chips";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { CATALOG_CATEGORIES } from "@/lib/catalog";
import { applyLiveCoaToCards } from "@/lib/integrations/coa/client";
import {
  CATALOG_DEFAULT_PAGE_SIZE,
  type CatalogFacetCounts,
  type CatalogFilters as Filters,
  type ProductCardModel,
} from "@/lib/catalog/types";
import type { CatalogSeoLink } from "@/lib/seo/related-posts";
import { AnswerCapsule } from "@/components/seo/answer-capsule";
import { OutboundCitations } from "@/components/seo/outbound-citations";
import { outboundCitationsFor } from "@/lib/seo/outbound-citations";

type Props = {
  title: string;
  description?: string;
  basePath: string;
  ageVerified: boolean;
  filters: Filters;
  items: ProductCardModel[];
  total: number;
  page?: number;
  pageSize?: number;
  facets: CatalogFacetCounts;
  /** Pillar → cluster educational / commercial links under the header */
  seoLinks?: CatalogSeoLink[];
  /** GEO answer capsule shown under the H1 */
  answer?: string;
  /** When set, renders 2–3 educational outbound citations under the grid */
  outboundKey?: string;
};

export async function CatalogPageShell({
  title,
  description,
  basePath,
  ageVerified,
  filters,
  items: rawItems,
  total,
  page = 1,
  pageSize = CATALOG_DEFAULT_PAGE_SIZE,
  facets,
  seoLinks = [],
  answer,
  outboundKey,
}: Props) {
  const hasFilters = hasActiveCatalogFilters(filters, basePath);
  const items = ageVerified ? await applyLiveCoaToCards(rawItems) : rawItems;
  const activeCategory = basePath.startsWith("/shop/") ? basePath.split("/")[2] : undefined;
  const outbound = outboundKey ? outboundCitationsFor(outboundKey) : [];

  if (AGE_GATE_ENTRY_ENABLED && !ageVerified) {
    const [{ AgeGateDialog }, { AgeGateSeoTeaser }] = await Promise.all([
      import("@/components/shared/age-gate-dialog"),
      import("@/components/seo/age-gate-seo-teaser"),
    ]);
    return (
      <>
        <AgeGateDialog initiallyOpen />
        <AgeGateSeoTeaser
          title={title}
          description={
            description ??
            "Confirm you are 21+ (or a qualifying patient) to browse lab-tested DIME products available in your jurisdiction."
          }
        />
      </>
    );
  }

  return (
    <>
          <section className="page-header">
            <div className="mx-auto max-w-7xl px-[var(--container-pad-x)]">
              <p className="section-eyebrow">DIME</p>
              <h1 className="page-header-title">{title}</h1>
              {description ? <p className="page-header-lede">{description}</p> : null}

              {answer ? <AnswerCapsule className="mt-5 max-w-xl">{answer}</AnswerCapsule> : null}

              {seoLinks.length > 0 ? (
                <nav aria-label="Related guides" className="mt-5">
                  <ul className="flex flex-wrap gap-x-4 gap-y-2" role="list">
                    {seoLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="prose-link font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em]">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}

              <nav aria-label="Shop categories" className="mt-8 -mx-[var(--container-pad-x)] sm:mx-0">
                <ul
                  className="rail-scroll flex gap-2 overflow-x-auto px-[var(--container-pad-x)] pb-1 sm:flex-wrap sm:overflow-visible sm:px-0"
                  role="list"
                >
                  <li className="shrink-0">
                    <Link
                      href="/shop"
                      className={`inline-flex min-h-11 items-center border px-4 py-2.5 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] transition-colors duration-[var(--motion-fast)] ${
                        !activeCategory
                          ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                          : "border-[var(--color-border-interactive)] text-[var(--color-ink)] hover:border-[var(--color-ink)]"
                      }`}
                      aria-current={!activeCategory ? "page" : undefined}
                    >
                      All
                    </Link>
                  </li>
                  {CATALOG_CATEGORIES.map((cat) => {
                    const active = activeCategory === cat.slug;
                    return (
                      <li key={cat.slug} className="shrink-0">
                        <Link
                          href={`/shop/${cat.slug}`}
                          className={`inline-flex min-h-11 items-center border px-4 py-2.5 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] transition-colors duration-[var(--motion-fast)] ${
                            active
                              ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                              : "border-[var(--color-border-interactive)] text-[var(--color-ink)] hover:border-[var(--color-ink)]"
                          }`}
                          aria-current={active ? "page" : undefined}
                        >
                          {cat.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </section>

          <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-8 pb-24 sm:py-10 lg:py-12 lg:pb-12">
            <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
              <aside className="hidden lg:block">
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
                  Filters
                </p>
                <div className="mt-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <CatalogFilters basePath={basePath} filters={filters} facets={facets} />
                </div>
              </aside>

              <div className="space-y-5 sm:space-y-6">
                <CatalogToolbar basePath={basePath} filters={filters} total={total} />

                <ActiveFilterChips basePath={basePath} filters={filters} />

                <details className="border border-[var(--color-border)] bg-[var(--color-surface)] lg:hidden">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink)] touch-manipulation [&::-webkit-details-marker]:hidden">
                    <span>
                      Filters
                      {hasFilters ? (
                        <span className="ml-2 text-[var(--color-resin)]">(active)</span>
                      ) : null}
                    </span>
                    <span className="text-[var(--color-ink-muted)]" aria-hidden>
                      +
                    </span>
                  </summary>
                  <div className="border-t border-[var(--color-border)] px-4 py-4">
                    <CatalogFilters basePath={basePath} filters={filters} facets={facets} />
                  </div>
                </details>

                <ProductGrid products={items} basePath={basePath} hasActiveFilters={hasFilters} />

                <CatalogPagination
                  basePath={basePath}
                  filters={filters}
                  total={total}
                  page={page}
                  pageSize={pageSize}
                />

                {outbound.length > 0 ? (
                  <OutboundCitations citations={outbound} heading="Related references" />
                ) : null}
              </div>
            </div>
          </div>
    </>
  );
}
