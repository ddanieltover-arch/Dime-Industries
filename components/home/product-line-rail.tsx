// components/home/product-line-rail.tsx
import Link from "next/link";
import type { ProductLineSection } from "@/lib/data/products";
import { ProductCard } from "@/components/catalog/product-card";

export function ProductLineRail({ section }: { section: ProductLineSection }) {
  const headingId = `line-${section.slug}-heading`;

  return (
    <section aria-labelledby={headingId} className="section-pad border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-[var(--container-pad-x)]">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Product line
            </p>
            <h2 id={headingId} className="section-title mt-2">
              {section.name}
            </h2>
          </div>
          <Link
            href={`/shop/vapes/${section.slug}`}
            className="nav-link shrink-0 text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
          >
            View all
          </Link>
        </div>

        <div className="relative">
          <ul className="rail-scroll flex gap-4 overflow-x-auto pb-4" role="list">
            {section.products.map((product) => (
              <li key={product.slug} className="w-[16.5rem] shrink-0 sm:w-[18rem]">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--color-bg)] to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
