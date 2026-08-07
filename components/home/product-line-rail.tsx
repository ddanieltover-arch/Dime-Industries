// components/home/product-line-rail.tsx
import type { ProductLineSection } from "@/lib/data/products";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductRailShell } from "@/components/home/product-rail-shell";
import { StaggerItem } from "@/components/motion";

export function ProductLineRail({ section }: { section: ProductLineSection }) {
  const headingId = `line-${section.slug}-heading`;

  return (
    <ProductRailShell
      headingId={headingId}
      eyebrow="Product line"
      title={section.name}
      viewAllHref={`/shop?line=${encodeURIComponent(section.slug)}`}
    >
      {section.products.map((product) => (
        <StaggerItem
          key={product.slug}
          as="li"
          className="w-[min(72vw,16.5rem)] shrink-0 snap-start sm:w-[18rem]"
        >
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </ProductRailShell>
  );
}
