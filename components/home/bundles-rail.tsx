// components/home/bundles-rail.tsx
import type { ProductLineSection } from "@/lib/data/products";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductRailShell } from "@/components/home/product-rail-shell";
import { StaggerItem } from "@/components/motion";

export function BundlesRail({ section }: { section: ProductLineSection }) {
  const headingId = "bundles-rail-heading";

  return (
    <ProductRailShell
      headingId={headingId}
      eyebrow="Elevate your experience"
      title="Shop bundles"
      description="Curated sets at a package price — shop now and save versus buying each item alone."
      viewAllHref="/shop/bundles"
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
