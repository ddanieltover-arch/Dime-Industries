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

      {!ageGate.ageVerified ? (
        <div aria-hidden="true" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface)]" />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
            Cart
          </h1>

          {cart.lines.length === 0 ? (
            <div className="mt-10 border border-dashed border-[var(--color-border)] px-6 py-16 text-center">
              <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
                Your cart is empty
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block text-[var(--scale-sm)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <>
              <ul className="mt-8 space-y-6" role="list">
                {cart.lines.map((line) => (
                  <li
                    key={line.variantId}
                    className="border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                      <div>
                        <Link
                          href={`/product/${line.productSlug}`}
                          className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)] hover:text-[var(--color-resin)]"
                        >
                          {line.productName}
                        </Link>
                        <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                          {line.lineName} · {line.weightOrFormat}
                        </p>
                        <p className="mt-1 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                          THC {line.thcPct}% · CBD {line.cbdPct}% · {line.sku}
                        </p>
                        <p className="mt-2 text-[var(--scale-base)] text-[var(--color-ink)]">
                          {formatPrice(line.unitPriceCents)} each
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
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

              <aside className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <h2 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
                  Order summary
                </h2>
                <div className="mt-4">
                  <CouponForm appliedCode={coupon?.code ?? null} />
                </div>
                <dl className="mt-4 space-y-2 text-[var(--scale-sm)]">
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
                    <dd className="text-[var(--color-ink-soft)]">Calculated at checkout</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-ink-soft)]">Shipping</dt>
                    <dd className="text-[var(--color-ink-soft)]">Calculated at checkout</dd>
                  </div>
                </dl>
                <p className="mt-4 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                  No hidden fees — every charge is itemized before you pay. Try WELCOME10 or SAVE5.
                </p>
                <Link
                  href="/checkout"
                  className="mt-6 block w-full rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-3 text-center text-[var(--scale-sm)] text-[var(--color-surface)] hover:bg-[var(--color-resin-hover)]"
                >
                  Proceed to checkout
                </Link>
                <Link
                  href="/shop"
                  className="mt-3 block text-center text-[var(--scale-sm)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
                >
                  Continue shopping
                </Link>
              </aside>
            </>
          )}
        </div>
      )}
    </>
  );
}
