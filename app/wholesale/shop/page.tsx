// app/wholesale/shop/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { addWholesaleCartItemForm, updateWholesaleCartItemForm } from "@/app/(commerce)/wholesale-actions";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { formatPrice } from "@/lib/format";
import {
  applyWholesalePricing,
  getWholesaleCartSnapshot,
  getWholesaleOverrides,
  requireWholesaleBuyer,
  resolveWholesaleVariantPrice,
  WHOLESALE_DEFAULT_MOQ,
} from "@/lib/wholesale";

export const metadata: Metadata = {
  title: "Wholesale shop",
  robots: { index: false, follow: false },
};

export default async function WholesaleShopPage() {
  try {
    await requireWholesaleBuyer();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "AUTH_REQUIRED") redirect("/login?next=/wholesale/shop");
    redirect("/wholesale");
  }

  const [catalog, overrides, cart] = await Promise.all([
    loadEffectiveCatalog(),
    getWholesaleOverrides(),
    getWholesaleCartSnapshot(),
  ]);
  const products = applyWholesalePricing(
    catalog.filter((p) => p.status === "active"),
    overrides
  );

  return (
    <div className="mx-auto max-w-6xl px-[var(--container-pad-x)] py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-border)] pb-8">
        <div>
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            B2B
          </p>
          <h1 className="section-title mt-2">Wholesale shop</h1>
          <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Prices reflect wholesale tiers. MOQ applies per SKU.
          </p>
        </div>
        <Link href="/wholesale/checkout" className="btn-primary">
          Checkout ({cart.itemCount}) · {formatPrice(cart.subtotalCents)}
        </Link>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const variant = product.variants[0];
          if (!variant) return null;
          const retail = catalog
            .find((p) => p.id === product.id)
            ?.variants.find((v) => v.id === variant.id);
          const meta = resolveWholesaleVariantPrice(retail ?? variant, overrides);
          return (
            <li key={product.id} className="bg-[var(--color-surface)] p-5">
              <h2 className="font-[var(--font-display)] uppercase tracking-[0.04em] text-[var(--color-ink)]">
                {product.name}
              </h2>
              <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                {variant.weightOrFormat} · SKU {variant.sku}
              </p>
              <p className="mt-3 font-[var(--font-display)] text-[var(--color-resin-strong)]">
                {formatPrice(meta.wholesalePriceCents)}
                <span className="ml-2 text-[var(--scale-sm)] font-normal text-[var(--color-ink-muted)] line-through">
                  {formatPrice(meta.retailPriceCents)}
                </span>
              </p>
              <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                MOQ {meta.minQuantity} · stock {variant.quantityOnHand}
              </p>
              <form action={addWholesaleCartItemForm} className="mt-4 flex gap-2">
                <input type="hidden" name="variantId" value={variant.id} />
                <input
                  type="number"
                  name="quantity"
                  min={meta.minQuantity}
                  defaultValue={meta.minQuantity}
                  className="field-input w-20 px-3"
                />
                <button type="submit" className="btn-outline px-4 py-3">
                  Add
                </button>
              </form>
            </li>
          );
        })}
      </ul>

      {cart.lines.length > 0 ? (
        <section className="mt-12 border-t border-[var(--color-border)] pt-8">
          <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
            Cart
          </h2>
          <ul className="mt-4 space-y-3">
            {cart.lines.map((line) => (
              <li
                key={line.variantId}
                className="flex flex-wrap items-center justify-between gap-3 text-[var(--scale-sm)]"
              >
                <span>
                  {line.productName} · {formatPrice(line.unitPriceCents)}
                </span>
                <form action={updateWholesaleCartItemForm} className="flex items-center gap-2">
                  <input type="hidden" name="variantId" value={line.variantId} />
                  <input
                    type="number"
                    name="quantity"
                    min={cart.moqByVariant[line.variantId] ?? WHOLESALE_DEFAULT_MOQ}
                    defaultValue={line.quantity}
                    className="field-input w-20 px-3"
                  />
                  <button type="submit" className="nav-link text-[var(--color-resin)]">
                    Update
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
