// components/catalog/product-card.tsx
import Image from "next/image";
import Link from "next/link";
import type { ProductCardModel } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";

const STRAIN_LABEL: Record<ProductCardModel["strainType"], string> = {
  sativa: "Sativa",
  indica: "Indica",
  hybrid: "Hybrid",
};

export function ProductCard({ product }: { product: ProductCardModel }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-resin)]"
    >
      <div className="relative aspect-[4/5] bg-[var(--color-surface-raised)]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
            DIME
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
          <span>{product.line}</span>
          <span className="text-[var(--color-ink-soft)]">{STRAIN_LABEL[product.strainType]}</span>
        </div>

        <h3 className="mt-2 font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.04em] text-[var(--color-ink)] group-hover:text-[var(--color-resin)]">
          {product.name}
        </h3>

        <dl className="mt-3 flex gap-4 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          <div>
            <dt className="sr-only">THC</dt>
            <dd>THC {product.thcPct}%</dd>
          </div>
          <div>
            <dt className="sr-only">Format</dt>
            <dd>{product.weightOrFormat}</dd>
          </div>
        </dl>

        <p className="mt-auto pt-4 font-[var(--font-display)] text-[var(--scale-sm)] text-[var(--color-resin-strong)]">
          {product.variantCount > 1 ? "From " : ""}
          {formatPrice(product.retailPriceCents)}
        </p>
      </div>
    </Link>
  );
}
