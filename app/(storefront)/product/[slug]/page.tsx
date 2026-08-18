// app/product/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AGE_GATE_ENTRY_ENABLED } from "@/lib/compliance/age-gate-flags";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductGrid } from "@/components/catalog/product-grid";
import { AnalyticsWhenConsented } from "@/components/analytics/analytics-when-consented";
import { ViewItemEvent } from "@/components/analytics/view-item-event";
import { AddToCartForm } from "@/components/cart/add-to-cart-form";
import { WishlistToggle } from "@/components/cart/wishlist-toggle";
import { LoyaltyEarnCallout } from "@/components/product/loyalty-earn-callout";
import { MobilePdpBuyBar } from "@/components/product/mobile-pdp-buy-bar";
import { ProductRatingSummary, ProductReviews } from "@/components/product/product-reviews";
import { RecordProductView } from "@/components/catalog/record-product-view";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { getCurrentProfile } from "@/lib/auth/session";
import { listApprovedReviewsForProduct } from "@/lib/admin/reviews-store";
import { averageRating } from "@/lib/reviews/logic";
import {
  getProductBySlug,
  getRelatedProducts,
  listAllActiveSlugs,
  primaryVariant,
  withCatalogSource,
  isBundleProduct,
} from "@/lib/catalog";
import { BundleContents } from "@/components/catalog/bundle-contents";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { getRecentlyViewedCards } from "@/lib/recently-viewed/cookie";
import { readWishlistIds } from "@/lib/wishlist";
import { formatPct, formatPrice } from "@/lib/format";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { OutboundCitations } from "@/components/seo/outbound-citations";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/seo/json-ld";
import { outboundCitationsFor } from "@/lib/seo/outbound-citations";
import { productSeoInternalLinks } from "@/lib/seo/product-internal-links";
import {
  isStrainSeoProduct,
  productSeoMetaDescription,
  productSeoTitle,
} from "@/lib/catalog/seo-copy";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return listAllActiveSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await withCatalogSource(await loadEffectiveCatalog(), () => getProductBySlug(slug));
  if (!product) return { title: "Product" };
  const v = primaryVariant(product);
  const strainSeo = isStrainSeoProduct(product);
  const title = productSeoTitle(product);
  const description = strainSeo
    ? productSeoMetaDescription(
        product,
        product.variants[0]?.weightOrFormat ?? "cart",
        formatPct(v.thcPct)
      )
    : product.description;
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description: `${formatPct(v.thcPct)} THC · ${product.lineName ?? product.categoryName}`,
      images: product.imageUrl ? [product.imageUrl] : ["/brand/og.png"],
    },
  };
}

const STRAIN_LABEL: Record<string, string> = {
  sativa: "Sativa",
  indica: "Indica",
  hybrid: "Hybrid",
  na: "Accessory",
};

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const ageGate = await getAgeGateState();

  if (AGE_GATE_ENTRY_ENABLED && !ageGate.ageVerified) {
    const [{ AgeGateDialog }, { AgeGateSeoTeaser }] = await Promise.all([
      import("@/components/shared/age-gate-dialog"),
      import("@/components/seo/age-gate-seo-teaser"),
    ]);
    return (
      <>
        <AgeGateDialog initiallyOpen />
        <AgeGateSeoTeaser
          title="DIME product details"
          description="Confirm you are 21+ (or a qualifying patient) to view this product’s details, lab data, and pricing. Meanwhile, explore About, Blog, Find DIME, and Validate."
        />
      </>
    );
  }

  const catalog = await loadEffectiveCatalog();
  const product = withCatalogSource(catalog, () => getProductBySlug(slug, ageGate.jurisdiction));
  if (!product) notFound();

  const related = withCatalogSource(catalog, () =>
    getRelatedProducts(product, ageGate.jurisdiction, 4)
  );
  const v = primaryVariant(product);
  const { applyLiveCoaToCards, fetchCoaBySku } = await import("@/lib/integrations/coa/client");

  const [relatedLive, recentLive, wishlistIds, profile, approvedReviews, coa] = await Promise.all([
    applyLiveCoaToCards(related),
    getRecentlyViewedCards(ageGate.jurisdiction, product.slug).then(applyLiveCoaToCards),
    readWishlistIds(),
    getCurrentProfile(),
    listApprovedReviewsForProduct({
      id: product.id,
      slug: product.slug,
    }),
    fetchCoaBySku(v.sku, product.coaUrl, product.name),
  ]);
  const reviewAvg = averageRating(approvedReviews);
  const primarySaved = wishlistIds.includes(v.id);
  const primaryImage =
    product.imageUrl || product.galleryUrls[0] || null;

  const jsonLd = buildProductJsonLd({
    name: product.name,
    description: product.description,
    slug: product.slug,
    sku: v.sku,
    imageUrl: product.imageUrl,
    priceCents: v.retailPriceCents,
    inStock: v.quantityOnHand > 0,
    aggregateRating:
      approvedReviews.length && reviewAvg != null
        ? { ratingValue: reviewAvg, reviewCount: approvedReviews.length }
        : null,
    reviews: approvedReviews.map((r) => ({
      authorName: "Verified buyer",
      rating: r.rating,
      body: r.body,
      datePublished: r.createdAt,
    })),
  });

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: product.categoryName, path: `/shop/${product.categorySlug}` },
    { name: product.name, path: `/product/${product.slug}` },
  ]);

  const seoInternal = productSeoInternalLinks({
    slug: product.slug,
    lineSlug: product.lineSlug,
    categorySlug: product.categorySlug,
  });
  const outbound = outboundCitationsFor(`product:${product.slug}`);

  return (
    <>
      <RecordProductView slug={product.slug} />
      <JsonLdScript data={jsonLd} />
      <JsonLdScript data={breadcrumbs} />

      <MobilePdpBuyBar
        priceCents={v.retailPriceCents}
        productName={product.name}
        inStock={v.quantityOnHand > 0}
      />

      <article className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-8 pb-24 sm:py-10 lg:py-14 lg:pb-14">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 overflow-x-auto text-[var(--scale-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-muted)] sm:mb-8"
        >
          <ol className="flex min-w-max flex-wrap items-center gap-2 font-[var(--font-display)] sm:min-w-0">
            <li>
              <Link href="/shop" className="hover:text-[var(--color-resin)]">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/shop/${product.categorySlug}`} className="hover:text-[var(--color-resin)]">
                {product.categoryName}
              </Link>
            </li>
            {product.lineSlug && product.lineName ? (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={`/shop/${product.categorySlug}/${product.lineSlug}`}
                    className="hover:text-[var(--color-resin)]"
                  >
                    {product.lineName}
                  </Link>
                </li>
              </>
            ) : null}
            <li aria-hidden="true">/</li>
            <li className="text-[var(--color-ink)]" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-14">
          <div>
            <ProductGallery
              imageUrl={primaryImage}
              productName={product.name}
              fallbackLabel={v.sku}
            />
            <OutboundCitations citations={outbound} className="hidden lg:block lg:mt-8" />
          </div>

          <div className="lg:sticky lg:top-[5.5rem] lg:self-start">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              {isBundleProduct(product)
                ? "Bundle"
                : STRAIN_LABEL[product.strainType]}
              {!isBundleProduct(product) && product.lineName ? ` · ${product.lineName}` : ""}
            </p>
            <h1 className="mt-3 font-[var(--font-display)] text-[clamp(1.75rem,4vw,2.75rem)] uppercase leading-[1.05] tracking-[0.04em] text-[var(--color-ink)]">
              {isStrainSeoProduct(product) ? productSeoTitle(product) : product.name}
            </h1>

            <p className="mt-4 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-resin-strong)]">
              {formatPrice(v.retailPriceCents)}
              {product.compareAtPriceCents != null &&
              product.compareAtPriceCents > v.retailPriceCents ? (
                <span className="ml-3 text-[var(--scale-base)] text-[var(--color-ink-muted)] line-through">
                  {formatPrice(product.compareAtPriceCents)}
                </span>
              ) : null}
            </p>
            <ProductRatingSummary reviews={approvedReviews} />
            {product.compareAtPriceCents != null &&
            product.compareAtPriceCents > v.retailPriceCents ? (
              <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-resin)]">
                Save {formatPrice(product.compareAtPriceCents - v.retailPriceCents)} versus buying
                separately
              </p>
            ) : null}

            <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-[var(--color-border)] py-5 sm:mt-8 sm:gap-4 sm:py-6">
              <div>
                <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                  THC
                </dt>
                <dd className="mt-1 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)] sm:text-[var(--scale-xl)]">
                  {formatPct(v.thcPct)}
                </dd>
              </div>
              <div>
                <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                  CBD
                </dt>
                <dd className="mt-1 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)] sm:text-[var(--scale-xl)]">
                  {formatPct(v.cbdPct)}
                </dd>
              </div>
              {v.cbnPct != null ? (
                <div>
                  <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                    CBN
                  </dt>
                  <dd className="mt-1 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)] sm:text-[var(--scale-xl)]">
                    {formatPct(v.cbnPct)}
                  </dd>
                </div>
              ) : (
                <div>
                  <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                    Format
                  </dt>
                  <dd className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink)]">{v.weightOrFormat}</dd>
                </div>
              )}
            </dl>

            {/* Purchase first — details follow so mobile shoppers reach ATC without scrolling past copy */}
            <div className="mt-6 space-y-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:mt-8 sm:p-5">
              <AnalyticsWhenConsented>
                <ViewItemEvent
                  itemId={product.id}
                  itemName={product.name}
                  itemVariant={v.weightOrFormat}
                  priceUsd={v.retailPriceCents / 100}
                />
              </AnalyticsWhenConsented>
              <AddToCartForm
                variants={product.variants}
                defaultVariantId={v.id}
                productId={product.id}
                productName={product.name}
                productSlug={product.slug}
              />
              <WishlistToggle variantId={v.id} initiallySaved={primarySaved} />
            </div>

            <div className="mt-4">
              <LoyaltyEarnCallout priceCents={v.retailPriceCents} signedIn={Boolean(profile)} />
            </div>

            <p className="mt-6 text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              {product.description}
            </p>

            {seoInternal.length > 0 ? (
              <nav aria-label="Related DIME guides" className="mt-5">
                <ul className="flex flex-wrap gap-x-4 gap-y-2" role="list">
                  {seoInternal.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] underline-offset-4 hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <BundleContents bundle={product} catalog={catalog} />

            {product.effects.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Effects">
                {product.effects.map((effect) => (
                  <li
                    key={effect}
                    className="border border-[var(--color-border)] px-3 py-1.5 font-[var(--font-display)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-soft)]"
                  >
                    {effect}
                  </li>
                ))}
              </ul>
            ) : null}

            {product.variants.length > 1 ? (
              <section className="mt-8 sm:mt-10" aria-labelledby="variants-heading">
                <h2
                  id="variants-heading"
                  className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]"
                >
                  All formats
                </h2>
                <ul className="mt-3 space-y-2" role="list">
                  {product.variants.map((variant) => (
                    <li
                      key={variant.id}
                      className="flex items-center justify-between gap-3 bg-[var(--color-surface)] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-[var(--font-display)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                          {variant.weightOrFormat}
                        </p>
                        <p className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                          {variant.sku}
                          {variant.quantityOnHand <= 0
                            ? " · Out of stock"
                            : variant.quantityOnHand < 20
                              ? " · Low stock"
                              : ""}
                        </p>
                      </div>
                      <p className="shrink-0 font-[var(--font-display)] text-[var(--scale-base)] text-[var(--color-resin-strong)] sm:text-[var(--scale-lg)]">
                        {formatPrice(variant.retailPriceCents)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <Link
                href={`/lab-results?sku=${encodeURIComponent(v.sku)}`}
                className="nav-link min-h-11 inline-flex items-center text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
              >
                View lab results / COA
                {coa?.source === "live" ? " (live)" : ""}
              </Link>
              <Link
                href="/validate"
                className="nav-link min-h-11 inline-flex items-center text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
              >
                Validate product
              </Link>
            </div>

            <OutboundCitations citations={outbound} className="lg:hidden" />
          </div>
        </div>

        <ProductReviews
          productSlug={product.slug}
          productName={product.name}
          reviews={approvedReviews}
          signedIn={Boolean(profile)}
        />

        {relatedLive.length > 0 ? (
          <section className="mt-20 border-t border-[var(--color-border)] pt-14" aria-labelledby="related-heading">
            <h2 id="related-heading" className="section-title mb-8">
              Related in {product.categoryName}
            </h2>
            <ProductGrid products={relatedLive} columns={4} />
          </section>
        ) : null}

        {recentLive.length > 0 ? (
          <section className="mt-16" aria-labelledby="recent-heading">
            <h2 id="recent-heading" className="section-title mb-8">
              Recently viewed
            </h2>
            <ProductGrid products={recentLive} />
          </section>
        ) : null}
      </article>
    </>
  );
}
