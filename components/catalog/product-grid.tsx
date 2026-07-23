// components/catalog/product-grid.tsx
import type { ProductCardModel } from "@/lib/catalog/types";
import { ProductCard } from "@/components/catalog/product-card";

export function ProductGrid({ products }: { products: ProductCardModel[] }) {
  if (products.length === 0) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center"
      >
        <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          No products match these filters
        </p>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Try clearing a filter or searching a different strain or format.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
