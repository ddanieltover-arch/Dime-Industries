// app/admin/products/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import {
  getAdminCatalog,
  getCatalogOverrides,
  hasProductOverride,
} from "@/lib/admin/catalog-overrides";
import {
  ClearProductOverrideForm,
  ProductStatusForm,
  VariantPriceForm,
} from "@/components/admin/product-admin-forms";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Admin product overrides",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  await requireAdmin();
  const [products, overrides] = await Promise.all([getAdminCatalog(), getCatalogOverrides()]);
  const overrideCount = products.filter((p) => hasProductOverride(overrides, p.id)).length;

  return (
    <div>
      <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
        Product overrides
      </h2>
      <p className="mt-2 max-w-2xl text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Edit name, status, and price on the existing catalog only. New SKUs come from the brand
        catalog import / seed — there is no admin product create.
      </p>
      <p className="mt-2 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
        {overrideCount} of {products.length} products currently overridden
      </p>
      <ul className="mt-8 space-y-6" role="list">
        {products.map((product) => {
          const overridden = hasProductOverride(overrides, product.id);
          return (
            <li
              key={product.id}
              className="border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
                    {product.name}
                    {overridden ? (
                      <span className="ml-2 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                        overridden
                      </span>
                    ) : null}
                  </p>
                  <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                    {product.id} · /{product.slug} · {product.categoryName} ·{" "}
                    {product.lineName ?? "—"} · {product.status}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-[var(--scale-xs)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
                    >
                      View PDP
                    </Link>
                    {overridden ? <ClearProductOverrideForm productId={product.id} /> : null}
                  </div>
                </div>
                <ProductStatusForm
                  productId={product.id}
                  name={product.name}
                  status={product.status}
                />
              </div>
              <ul className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-3" role="list">
                {product.variants.map((v) => (
                  <li
                    key={v.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-[var(--scale-sm)]"
                  >
                    <span className="text-[var(--color-ink-soft)]">
                      {v.weightOrFormat} · {v.sku} · stock {v.quantityOnHand} ·{" "}
                      {formatPrice(v.retailPriceCents)}
                      {overrides[product.id]?.variants?.[v.id]?.retailPriceCents != null ? (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-[var(--color-resin)]">
                          price override
                        </span>
                      ) : null}
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
          );
        })}
      </ul>
    </div>
  );
}
