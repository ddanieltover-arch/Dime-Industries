// app/cart/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { CartLineControls } from "@/components/cart/cart-line-controls";
import { CouponForm } from "@/components/cart/coupon-form";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { getCartSnapshot } from "@/lib/cart";
import { resolveAppliedCoupon } from "@/lib/coupons/store";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cart" },
};

export default async function CartPage() {
  const ageGate = await getAgeGateState();
  const cart = ageGate.ageVerified
    ? await getCartSnapshot()
    : { lines: [], itemCount: 0, subtotalCents: 0 };
  const coupon =
    ageGate.ageVerified && cart.lines.length
      ? await resolveAppliedCoupon(cart.subtotalCents)
      : null;
  const discountCents = coupon?.discountCents ?? 0;

  return (
    <>
      <AgeGateDialog initiallyOpen={!ageGate.ageVerified} />

      {!ageGate.ageVerified ? null : (
        <div className="mx-auto max-w-5xl px-[var(--container-pad-x)] py-10 lg:py-14">
          <header className="border-b border-[var(--color-border)] pb-8">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Bag
            </p>
            <h1 className="section-title mt-2">Cart</h1>
          </header>

          {cart.lines.length === 0 ? (
            <div className="mt-12 border border-dashed border-[var(--color-border)] px-6 py-20 text-center">
              <p className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                Your cart is empty
              </p>
              <Link href="/shop" className="btn-primary mt-6">
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
              <ul className="space-y-4" role="list">
                {cart.lines.map((line) => (
                  <li key={line.variantId} className="bg-[var(--color-surface)] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                      <div>
                        <Link
                          href={`/product/${line.productSlug}`}
                          className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.04em] text-[var(--color-ink)] hover:text-[var(--color-resin)]"
                        >
                          {line.productName}
                        </Link>
                        <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                          {line.lineName} · {line.weightOrFormat}
                        </p>
                        <p className="mt-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                          THC {line.thcPct}% · CBD {line.cbdPct}% · {line.sku}
                        </p>
                        <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                          {formatPrice(line.unitPriceCents)} each
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-resin-strong)]">
                          {formatPrice(line.unitPriceCents * line.quantity)}
                        </p>
                        <div className="mt-3">
                          <CartLineControls
                            variantId={line.variantId}
                            quantity={line.quantity}
                            maxQuantity={line.maxQuantity}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                  Order summary
                </h2>
                <div className="mt-4">
                  <CouponForm appliedCode={coupon?.code ?? null} />
                </div>
                <dl className="mt-5 space-y-2.5 text-[var(--scale-sm)]">
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-ink-soft)]">Subtotal ({cart.itemCount} items)</dt>
                    <dd className="text-[var(--color-ink)]">{formatPrice(cart.subtotalCents)}</dd>
                  </div>
                  {discountCents > 0 ? (
                    <div className="flex justify-between">
                      <dt className="text-[var(--color-terp)]">{coupon?.label ?? "Discount"}</dt>
                      <dd className="text-[var(--color-terp)]">−{formatPrice(discountCents)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-ink-soft)]">Tax</dt>
                    <dd className="text-[var(--color-ink-muted)]">At checkout</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-ink-soft)]">Shipping</dt>
                    <dd className="text-[var(--color-ink-muted)]">At checkout</dd>
                  </div>
                </dl>
                <p className="mt-4 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                  No hidden fees — every charge is itemized before you pay.
                </p>
                <Link href="/checkout" className="btn-primary mt-6 w-full">
                  Proceed to checkout
                </Link>
                <Link
                  href="/shop"
                  className="mt-4 block text-center font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] hover:text-[var(--color-resin)]"
                >
                  Continue shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      )}
    </>
  );
}
