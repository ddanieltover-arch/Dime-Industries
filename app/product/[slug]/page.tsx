// app/product/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductGrid } from "@/components/catalog/product-grid";
import { AddToCartForm } from "@/components/cart/add-to-cart-form";
import { WishlistToggle } from "@/components/cart/wishlist-toggle";
import { LoyaltyEarnCallout } from "@/components/product/loyalty-earn-callout";
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

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return listAllActiveSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await withCatalogSource(await loadEffectiveCatalog(), () => getProductBySlug(slug));
  if (!product) return { title: "Product" };
  const v = primaryVariant(product);
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
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

  if (!ageGate.ageVerified) {
    return <AgeGateDialog initiallyOpen />;
  }

  const catalog = await loadEffectiveCatalog();
  const product = withCatalogSource(catalog, () => getProductBySlug(slug, ageGate.jurisdiction));
  if (!product) notFound();

  const related = withCatalogSource(catalog, () =>
    getRelatedProducts(product, ageGate.jurisdiction)
  );
  const recent = await getRecentlyViewedCards(ageGate.jurisdiction, product.slug);
  const { applyLiveCoaToCards } = await import("@/lib/integrations/coa/client");
  const [relatedLive, recentLive] = await Promise.all([
    applyLiveCoaToCards(related),
    applyLiveCoaToCards(recent),
  ]);
  const wishlistIds = await readWishlistIds();
  const profile = await getCurrentProfile();
  const approvedReviews = await listApprovedReviewsForProduct({
    id: product.id,
    slug: product.slug,
  });
  const reviewAvg = averageRating(approvedReviews);
  const v = primaryVariant(product);
  const primarySaved = wishlistIds.includes(v.id);
  const { fetchCoaBySku } = await import("@/lib/integrations/coa/client");
  const coa = await fetchCoaBySku(v.sku, product.coaUrl, product.name);
  const gallery =
    product.galleryUrls.length > 0 ? product.galleryUrls : product.imageUrl ? [product.imageUrl] : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: v.sku,
    image: product.imageUrl ?? undefined,
    brand: { "@type": "Brand", name: "DIME" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (v.retailPriceCents / 100).toFixed(2),
      availability:
        v.quantityOnHand > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `https://dimeindustries.us/product/${product.slug}`,
    },
    ...(approvedReviews.length && reviewAvg != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewAvg,
            reviewCount: approvedReviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <>
      <AgeGateDialog initiallyOpen={false} />
      <RecordProductView slug={product.slug} />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-10 lg:py-14">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 text-[var(--scale-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]"
        >
          <ol className="flex flex-wrap items-center gap-2 font-[var(--font-display)]">
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

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          <ProductGallery images={gallery} productName={product.name} fallbackLabel={v.sku} />

          <div className="lg:sticky lg:top-[5.5rem] lg:self-start">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              {isBundleProduct(product)
                ? "Bundle"
                : STRAIN_LABEL[product.strainType]}
              {!isBundleProduct(product) && product.lineName ? ` · ${product.lineName}` : ""}
            </p>
            <h1 className="mt-3 font-[var(--font-display)] text-[clamp(1.75rem,4vw,2.75rem)] uppercase leading-[1.05] tracking-[0.04em] text-[var(--color-ink)]">
              {product.name}
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

            <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-[var(--color-border)] py-6">
              <div>
                <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                  THC
                </dt>
                <dd className="mt-1 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
                  {formatPct(v.thcPct)}
                </dd>
              </div>
              <div>
                <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                  CBD
                </dt>
                <dd className="mt-1 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
                  {formatPct(v.cbdPct)}
                </dd>
              </div>
              {v.cbnPct != null ? (
                <div>
                  <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                    CBN
                  </dt>
                  <dd className="mt-1 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
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

            <p className="mt-6 text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              {product.description}
            </p>

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

            <section className="mt-10" aria-labelledby="variants-heading">
              <h2
                id="variants-heading"
                className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]"
              >
                Formats
              </h2>
              <ul className="mt-3 space-y-2" role="list">
                {product.variants.map((variant) => (
                  <li
                    key={variant.id}
                    className="flex items-center justify-between bg-[var(--color-surface)] px-4 py-3"
                  >
                    <div>
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
                    <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-resin-strong)]">
                      {formatPrice(variant.retailPriceCents)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-8 space-y-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <AddToCartForm variants={product.variants} defaultVariantId={v.id} />
              <WishlistToggle variantId={v.id} initiallySaved={primarySaved} />
            </div>

            <div className="mt-4">
              <LoyaltyEarnCallout priceCents={v.retailPriceCents} signedIn={Boolean(profile)} />
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href={`/lab-results?sku=${encodeURIComponent(v.sku)}`}
                className="nav-link text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
              >
                View lab results / COA
                {coa?.source === "live" ? " (live)" : ""}
              </Link>
              <Link
                href="/validate"
                className="nav-link text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
              >
                Validate product
              </Link>
            </div>
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
            <ProductGrid products={relatedLive} />
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
