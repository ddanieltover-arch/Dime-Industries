// components/catalog/product-grid.tsx
import Link from "next/link";
import type { ProductCardModel } from "@/lib/catalog/types";
import { ProductCard } from "@/components/catalog/product-card";

export function ProductGrid({
  products,
  basePath = "/shop",
  hasActiveFilters = false,
}: {
  products: ProductCardModel[];
  basePath?: string;
  hasActiveFilters?: boolean;
}) {
  if (products.length === 0) {
    return (
      <div
        role="status"
        className="border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center"
      >
        <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
          {hasActiveFilters ? "No matches" : "Empty shelf"}
        </p>
        <p className="mt-3 font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
          {hasActiveFilters ? "No products match these filters" : "No products available here yet"}
        </p>
        <p className="mx-auto mt-3 max-w-md text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          {hasActiveFilters
            ? "Try removing a strain, potency, or format chip — or clear everything and browse the full catalog."
            : "Check back soon, or browse another category."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {hasActiveFilters ? (
            <Link href={basePath} className="btn-primary">
              Clear filters
            </Link>
          ) : null}
          <Link href="/shop" className={hasActiveFilters ? "btn-outline" : "btn-primary"}>
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3" role="list">
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
