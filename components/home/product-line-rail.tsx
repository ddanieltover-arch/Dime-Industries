// components/home/product-line-rail.tsx
import Link from "next/link";
import type { ProductLineSection } from "@/lib/data/products";
import { ProductCard } from "@/components/home/product-card";

export function ProductLineRail({ section }: { section: ProductLineSection }) {
  const headingId = `line-${section.slug}-heading`;

  return (
    <section aria-labelledby={headingId} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 id={headingId} className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          {section.name}
        </h2>
        <Link
          href={`/shop/vapes/${section.slug}`}
          className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 hover:text-[var(--color-resin)] hover:underline"
        >
          View all
        </Link>
      </div>

      <ul className="flex gap-4 overflow-x-auto pb-2" role="list">
        {section.products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
