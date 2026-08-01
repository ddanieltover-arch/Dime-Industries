// components/catalog/bundle-contents.tsx
import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";
import { primaryVariant } from "@/lib/catalog";

type Props = {
  bundle: CatalogProduct;
  catalog: CatalogProduct[];
};

export function BundleContents({ bundle, catalog }: Props) {
  const components = bundle.bundleComponents ?? [];
  if (components.length === 0) return null;

  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const rows = components
    .map((c) => {
      const product = bySlug.get(c.productSlug);
      if (!product) return null;
      const v = primaryVariant(product);
      return { component: c, product, variant: v };
    })
    .filter(Boolean) as {
    component: { productSlug: string; quantity: number };
    product: CatalogProduct;
    variant: ReturnType<typeof primaryVariant>;
  }[];

  if (rows.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="bundle-contents-heading">
      <h2
        id="bundle-contents-heading"
        className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]"
      >
        What&apos;s included
      </h2>
      <ul className="mt-4 space-y-3" role="list">
        {rows.map(({ component, product, variant }) => (
          <li key={product.slug}>
            <Link
              href={`/product/${product.slug}`}
              className="flex items-center gap-3 bg-[var(--color-surface)] px-3 py-3 transition-colors hover:bg-[var(--color-surface-raised)]"
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-[var(--color-bg)]">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="56px"
                  />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                  {component.quantity > 1 ? `${component.quantity}× ` : ""}
                  {product.name}
                </span>
                <span className="mt-0.5 block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                  {product.lineName ?? product.categoryName} · {formatPrice(variant.retailPriceCents)}
                  each
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
