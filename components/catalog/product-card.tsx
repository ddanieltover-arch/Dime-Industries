// components/catalog/product-card.tsx
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
      className="group flex h-full flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition-shadow hover:shadow-[var(--shadow-card)] focus-visible:shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center justify-between font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        <span>{STRAIN_LABEL[product.strainType]}</span>
        <span>
          {product.weightOrFormat}
          {product.variantCount > 1 ? " · options" : ""}
        </span>
      </div>

      <h3 className="mt-3 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)] group-hover:text-[var(--color-resin)]">
        {product.name}
      </h3>
      <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{product.line}</p>

      {/* Always-visible potency — Eaze research finding */}
      <dl className="mt-3 flex gap-4 font-[var(--font-mono)] text-[var(--scale-xs)]">
        <div>
          <dt className="text-[var(--color-ink-soft)]">THC</dt>
          <dd className="text-[var(--color-ink)]">{product.thcPct}%</dd>
        </div>
        <div>
          <dt className="text-[var(--color-ink-soft)]">CBD</dt>
          <dd className="text-[var(--color-ink)]">{product.cbdPct}%</dd>
        </div>
      </dl>

      <p className="mt-auto pt-4 font-[var(--font-display)] text-[var(--scale-base)] text-[var(--color-ink)]">
        {product.variantCount > 1 ? "From " : ""}
        {formatPrice(product.retailPriceCents)}
      </p>
    </Link>
  );
}
