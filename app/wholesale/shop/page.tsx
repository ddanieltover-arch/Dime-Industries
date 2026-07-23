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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
            Wholesale shop
          </h1>
          <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Prices reflect wholesale tiers. MOQ applies per SKU.
          </p>
        </div>
        <Link
          href="/wholesale/checkout"
          className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-2 text-[var(--scale-sm)] text-[var(--color-surface)]"
        >
          Checkout ({cart.itemCount}) · {formatPrice(cart.subtotalCents)}
        </Link>
      </div>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const variant = product.variants[0];
          if (!variant) return null;
          const retail = catalog
            .find((p) => p.id === product.id)
            ?.variants.find((v) => v.id === variant.id);
          const meta = resolveWholesaleVariantPrice(
            retail ?? variant,
            overrides
          );
          return (
            <li key={product.id} className="border border-[var(--color-border)] p-4">
              <h2 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
                {product.name}
              </h2>
              <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                {variant.weightOrFormat} · SKU {variant.sku}
              </p>
              <p className="mt-3 text-[var(--color-ink)]">
                {formatPrice(meta.wholesalePriceCents)}
                <span className="ml-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)] line-through">
                  {formatPrice(meta.retailPriceCents)}
                </span>
              </p>
              <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                MOQ {meta.minQuantity} · stock {variant.quantityOnHand}
              </p>
              <form action={addWholesaleCartItemForm} className="mt-4 flex gap-2">
                <input type="hidden" name="variantId" value={variant.id} />
                <input
                  type="number"
                  name="quantity"
                  min={meta.minQuantity}
                  defaultValue={meta.minQuantity}
                  className="w-20 border border-[var(--color-border)] px-2 py-1 text-[var(--scale-sm)]"
                />
                <button
                  type="submit"
                  className="border border-[var(--color-border)] px-3 py-1 text-[var(--scale-sm)] hover:bg-[var(--color-surface)]"
                >
                  Add
                </button>
              </form>
            </li>
          );
        })}
      </ul>

      {cart.lines.length > 0 ? (
        <section className="mt-12 border-t border-[var(--color-border)] pt-8">
          <h2 className="font-[var(--font-display)] text-[var(--scale-xl)]">Cart</h2>
          <ul className="mt-4 space-y-3">
            {cart.lines.map((line) => (
              <li key={line.variantId} className="flex flex-wrap items-center justify-between gap-3 text-[var(--scale-sm)]">
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
                    className="w-20 border border-[var(--color-border)] px-2 py-1"
                  />
                  <button type="submit" className="underline underline-offset-4">
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
