// components/catalog/product-card.tsx
import Image from "next/image";
import Link from "next/link";
import { QuickAddToCart } from "@/components/cart/quick-add-to-cart";
import type { ProductCardModel } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";

const STRAIN_LABEL: Record<ProductCardModel["strainType"], string> = {
  sativa: "Sativa",
  indica: "Indica",
  hybrid: "Hybrid",
};

export function ProductCard({ product }: { product: ProductCardModel }) {
  const href = `/product/${product.slug}`;
  const labHref = `/lab-results?sku=${encodeURIComponent(product.primarySku)}`;

  return (
    <article className="group flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-bg)] transition-[transform,box-shadow] duration-[var(--motion-base)] ease-[var(--ease-out)] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[var(--shadow-card)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg)]">
        <Link href={href} className="absolute inset-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain p-3 transition-transform duration-500 ease-[var(--ease-out)] sm:p-5 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              DIME
            </div>
          )}
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          <span className="bg-[var(--color-ink)] px-2 py-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-white">
            {product.isBundle ? "Bundle" : product.line}
          </span>
          {product.coaLive ? (
            <Link
              href={labHref}
              className="pointer-events-auto border border-[var(--color-ink)] bg-white px-2 py-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-band)]"
              aria-label={`View live lab COA for ${product.name}`}
            >
              Live COA
            </Link>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          <span>{STRAIN_LABEL[product.strainType]}</span>
          <span>THC {product.thcPct}%</span>
        </div>

        <h3 className="mt-2 font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.04em] text-[var(--color-ink)] sm:text-[var(--scale-base)]">
          <Link
            href={href}
            className="underline-offset-2 transition-colors hover:text-[var(--color-ink)] hover:underline"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">{product.weightOrFormat}</p>

        <p className="mt-auto pt-3 font-[var(--font-display)] text-[var(--scale-sm)] text-[var(--color-ink)] sm:pt-4">
          {product.variantCount > 1 ? "From " : ""}
          {formatPrice(product.retailPriceCents)}
          {product.compareAtPriceCents ? (
            <span className="ml-2 text-[var(--scale-xs)] font-normal text-[var(--color-ink-muted)] line-through">
              {formatPrice(product.compareAtPriceCents)}
            </span>
          ) : null}
        </p>

        {!product.inStock ? (
          <p className="mt-3 border border-[var(--color-flag)] px-3 py-2 text-center font-[var(--font-display)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-flag)]">
            Out of stock
          </p>
        ) : product.variantCount > 1 ? (
          <Link
            href={href}
            className="btn-outline mt-3 min-h-11 w-full touch-manipulation py-2.5 text-center text-[10px] tracking-[0.12em]"
          >
            Select options
          </Link>
        ) : (
          <QuickAddToCart
            variantId={product.primaryVariantId}
            productName={product.name}
            productId={product.primarySku}
            productSlug={product.slug}
            priceCents={product.retailPriceCents}
          />
        )}
      </div>
    </article>
  );
}
