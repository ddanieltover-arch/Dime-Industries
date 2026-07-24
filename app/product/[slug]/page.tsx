// app/product/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { ProductGrid } from "@/components/catalog/product-grid";
import { AddToCartForm } from "@/components/cart/add-to-cart-form";
import { WishlistToggle } from "@/components/cart/wishlist-toggle";
import { RecordProductView } from "@/components/catalog/record-product-view";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import {
  getProductBySlug,
  getRelatedProducts,
  listAllActiveSlugs,
  primaryVariant,
} from "@/lib/catalog";
import { getRecentlyViewedCards } from "@/lib/recently-viewed/cookie";
import { readWishlistIds } from "@/lib/wishlist";
import { formatPct, formatPrice } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return listAllActiveSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  const v = primaryVariant(product);
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: `${formatPct(v.thcPct)} THC · ${product.lineName ?? product.categoryName}`,
      images: product.imageUrl ? [product.imageUrl] : undefined,
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
    return (
      <>
        <AgeGateDialog initiallyOpen />
        <div className="min-h-[70vh] bg-black" aria-hidden="true" />
      </>
    );
  }

  const product = getProductBySlug(slug, ageGate.jurisdiction);
  if (!product) notFound();

  const related = getRelatedProducts(product, ageGate.jurisdiction);
  const recent = await getRecentlyViewedCards(ageGate.jurisdiction, product.slug);
  const wishlistIds = await readWishlistIds();
  const v = primaryVariant(product);
  const primarySaved = wishlistIds.includes(v.id);
  const { fetchCoaBySku } = await import("@/lib/integrations/coa/client");
  const coa = await fetchCoaBySku(v.sku, product.coaUrl);
  const gallery = product.galleryUrls.length > 0 ? product.galleryUrls : product.imageUrl ? [product.imageUrl] : [];

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

      <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          <ol className="flex flex-wrap gap-2">
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

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
              {gallery[0] ? (
                <Image
                  src={gallery[0]}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-[var(--font-display)] uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                  {v.sku}
                </div>
              )}
            </div>
            {gallery.length > 1 ? (
              <ul className="grid grid-cols-4 gap-2" role="list">
                {gallery.slice(0, 4).map((src) => (
                  <li key={src} className="relative aspect-square border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <Image src={src} alt="" fill className="object-contain p-2" sizes="120px" />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            <p className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              {STRAIN_LABEL[product.strainType]}
              {product.lineName ? ` · ${product.lineName}` : ""}
            </p>
            <h1 className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] uppercase leading-tight tracking-[0.04em] text-[var(--color-ink)] sm:text-[var(--scale-3xl)]">
              {product.name}
            </h1>

            <dl className="mt-6 flex flex-wrap gap-6">
              <div>
                <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                  THC
                </dt>
                <dd className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
                  {formatPct(v.thcPct)}
                </dd>
              </div>
              <div>
                <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                  CBD
                </dt>
                <dd className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
                  {formatPct(v.cbdPct)}
                </dd>
              </div>
              {v.cbnPct != null ? (
                <div>
                  <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                    CBN
                  </dt>
                  <dd className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
                    {formatPct(v.cbnPct)}
                  </dd>
                </div>
              ) : null}
            </dl>

            <p className="mt-6 text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              {product.description}
            </p>

            {product.effects.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Effects">
                {product.effects.map((effect) => (
                  <li
                    key={effect}
                    className="border border-[var(--color-border)] px-3 py-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-soft)]"
                  >
                    {effect}
                  </li>
                ))}
              </ul>
            ) : null}

            <section className="mt-8" aria-labelledby="variants-heading">
              <h2
                id="variants-heading"
                className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.14em] text-[var(--color-resin)]"
              >
                Formats
              </h2>
              <ul className="mt-3 space-y-2" role="list">
                {product.variants.map((variant) => (
                  <li
                    key={variant.id}
                    className="flex items-center justify-between border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3"
                  >
                    <div>
                      <p className="font-[var(--font-display)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                        {variant.weightOrFormat}
                      </p>
                      <p className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
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
              <p className="mt-2 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                Placeholder pricing until the official price sheet is applied.
              </p>
            </section>

            <div className="mt-8 space-y-4">
              <AddToCartForm variants={product.variants} defaultVariantId={v.id} />
              <WishlistToggle variantId={v.id} initiallySaved={primarySaved} />
            </div>

            <p className="mt-6 text-[var(--scale-sm)]">
              <Link
                href={`/lab-results?sku=${encodeURIComponent(v.sku)}`}
                className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-resin)] underline-offset-4 hover:underline"
              >
                View lab results / COA
                {coa?.source === "live" ? " (live host)" : ""}
              </Link>
            </p>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-16" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="mb-6 font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.08em] text-[var(--color-ink)]"
            >
              Related in {product.categoryName}
            </h2>
            <ProductGrid products={related} />
          </section>
        ) : null}

        {recent.length > 0 ? (
          <section className="mt-16" aria-labelledby="recent-heading">
            <h2
              id="recent-heading"
              className="mb-6 font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.08em] text-[var(--color-ink)]"
            >
              Recently viewed
            </h2>
            <ProductGrid products={recent} />
          </section>
        ) : null}
      </article>
    </>
  );
}
