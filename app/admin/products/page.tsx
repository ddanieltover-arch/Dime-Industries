// app/admin/products/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminCatalog } from "@/lib/admin/catalog-overrides";
import { ProductStatusForm, VariantPriceForm } from "@/components/admin/product-admin-forms";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Admin products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getAdminCatalog();

  return (
    <div>
      <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
        Products
      </h2>
      <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Edits apply as overrides on the seed catalog and reflect on the storefront.
      </p>
      <ul className="mt-8 space-y-6" role="list">
        {products.map((product) => (
          <li key={product.id} className="border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
                  {product.name}
                </p>
                <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                  {product.categoryName} · {product.lineName ?? "—"} · {product.status}
                </p>
                <Link
                  href={`/product/${product.slug}`}
                  className="mt-1 inline-block text-[var(--scale-xs)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
                >
                  View PDP
                </Link>
              </div>
              <ProductStatusForm productId={product.id} name={product.name} status={product.status} />
            </div>
            <ul className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-3" role="list">
              {product.variants.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 text-[var(--scale-sm)]">
                  <span className="text-[var(--color-ink-soft)]">
                    {v.weightOrFormat} · {v.sku} · stock {v.quantityOnHand} · {formatPrice(v.retailPriceCents)}
                  </span>
                  <VariantPriceForm
                    productId={product.id}
                    variantId={v.id}
                    priceCents={v.retailPriceCents}
                  />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
