// app/checkout/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { CouponForm } from "@/components/cart/coupon-form";
import { LoyaltyRedeemForm } from "@/components/checkout/loyalty-redeem-form";
import { getCartSnapshot } from "@/lib/cart";
import { computePricing } from "@/lib/checkout";
import { resolveAppliedCoupon } from "@/lib/coupons/store";
import { formatPrice } from "@/lib/format";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManualPaymentHandles } from "@/lib/payments/methods";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checkout" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  const ageGate = await getAgeGateState();
  const params = await searchParams;
  const paymentError = params.error === "payment_failed";
  const failedOrderId = typeof params.orderId === "string" ? params.orderId : null;

  if (paymentError && failedOrderId) {
    try {
      const { getOrderRepository } = await import("@/lib/checkout");
      const { changeOrderStatus } = await import("@/lib/checkout/status-change");
      const { releaseInventoryForOrder } = await import("@/lib/inventory");
      const existing = await getOrderRepository().getById(failedOrderId);
      if (existing?.status === "pending") {
        await changeOrderStatus(existing.id, "cancelled", { notify: true });
        await releaseInventoryForOrder(existing.id);
      }
    } catch (err) {
      console.warn("[checkout] payment_failed inventory release failed", err);
    }
  }

  const cart = ageGate.ageVerified
    ? await getCartSnapshot()
    : { lines: [], itemCount: 0, subtotalCents: 0 };
  const profile = await getCurrentProfile();
  const accountPrefs = profile
    ? await (await import("@/lib/account/prefs")).getAccountPrefs()
    : null;
  const defaultAddress =
    accountPrefs?.addresses.find((a) => a.isDefault) ?? accountPrefs?.addresses[0] ?? null;
  const coupon =
    ageGate.ageVerified && cart.lines.length
      ? await resolveAppliedCoupon(cart.subtotalCents)
      : null;
  const afterCoupon = Math.max(0, cart.subtotalCents - (coupon?.discountCents ?? 0));
  const { resolveLoyaltyRedeem } = await import("@/lib/loyalty/session-redeem");
  const loyalty = await resolveLoyaltyRedeem({
    email: profile?.email ?? null,
    subtotalAfterCouponCents: afterCoupon,
  });
  const loyaltyBalance = profile
    ? (await import("@/lib/loyalty/store")).getLoyaltyAccount(profile.email).then((a) => a.pointsBalance)
    : Promise.resolve(0);
  const balance = await loyaltyBalance;
  const checkoutJurisdiction = ageGate.jurisdiction ?? "CA";
  const pricing =
    ageGate.ageVerified && cart.lines.length
      ? computePricing(cart.lines, checkoutJurisdiction, coupon, loyalty)
      : null;

  return (
    <>
      <AgeGateDialog initiallyOpen={!ageGate.ageVerified} />

      {!ageGate.ageVerified ? null : (
        <>
          <section className="relative isolate overflow-hidden border-b border-[var(--color-border)]">
            <Image
              src="/brand/concrete.jpg"
              alt=""
              fill
              priority
              className="object-cover object-center opacity-40"
              sizes="100vw"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,14,14,0.96)_0%,rgba(14,14,14,0.88)_55%,rgba(14,14,14,0.75)_100%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_25%,rgba(201,177,56,0.12),transparent_50%)]"
              aria-hidden
            />

            <div className="relative mx-auto max-w-7xl px-[var(--container-pad-x)] py-12 sm:py-14">
              <p className="section-eyebrow">DIME</p>
              <h1 className="mt-2 font-[var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] uppercase leading-[0.95] tracking-[0.06em] text-white">
                Checkout
              </h1>
              <p className="mt-3 max-w-md text-[var(--scale-base)] text-white/75">
                {cart.lines.length === 0
                  ? "Add products to your cart before checking out."
                  : `Secure checkout for ${cart.itemCount} item${cart.itemCount === 1 ? "" : "s"} — CA & MA delivery.`}
              </p>
              {cart.lines.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#checkout-form" className="btn-primary">
                    Continue to details
                  </a>
                  <Link href="/cart" className="btn-outline-light">
                    Edit cart
                  </Link>
                </div>
              ) : (
                <div className="mt-6">
                  <Link href="/shop" className="btn-primary">
                    Return to shop
                  </Link>
                </div>
              )}
            </div>
          </section>

          {cart.lines.length === 0 ? (
            <section className="bg-[var(--color-bg)]">
              <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
                <div className="grid gap-px bg-[var(--color-border)] sm:grid-cols-2">
                  <div className="bg-[var(--color-surface)] p-6 sm:p-8">
                    <h2 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                      Shop the catalog
                    </h2>
                    <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                      Browse vapes, edibles, and prerolls — then come back to complete payment.
                    </p>
                    <Link
                      href="/shop"
                      className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
                    >
                      Browse shop →
                    </Link>
                  </div>
                  <div className="bg-[var(--color-surface)] p-6 sm:p-8">
                    <h2 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                      View your bag
                    </h2>
                    <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                      Already shopping? Open the cart to review items before checkout.
                    </p>
                    <Link
                      href="/cart"
                      className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
                    >
                      Go to cart →
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-[var(--color-bg)]">
              <div className="mx-auto grid max-w-7xl gap-10 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-[1fr_22rem] lg:gap-12">
                <div id="checkout-form" className="scroll-mt-24">
                  {paymentError ? (
                    <p
                      role="alert"
                      className="mb-6 border border-[var(--color-flag)] bg-[var(--color-surface)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-flag)]"
                    >
                      Payment was not completed. You can try again below.
                    </p>
                  ) : null}

                  <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7">
                    <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                      Offers
                    </p>
                    <h2 className="mt-2 font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                      Coupons & rewards
                    </h2>
                    <div className="mt-5 space-y-4">
                      <CouponForm appliedCode={pricing?.couponCode ?? null} />
                      {profile ? (
                        <LoyaltyRedeemForm
                          balance={balance}
                          appliedPoints={pricing?.loyaltyPointsRedeemed ?? 0}
                          appliedDiscountCents={pricing?.loyaltyDiscountCents ?? 0}
                        />
                      ) : (
                        <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                          <Link
                            href="/login?next=/checkout"
                            className="text-[var(--color-resin)] underline-offset-4 hover:underline"
                          >
                            Sign in
                          </Link>{" "}
                          to redeem loyalty points.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7">
                    <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                      Details
                    </p>
                    <h2 className="mt-2 font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                      Shipping & payment
                    </h2>
                    <div className="mt-6">
                      <CheckoutForm
                        jurisdiction={checkoutJurisdiction}
                        pricing={pricing!}
                        defaultEmail={profile?.email}
                        defaultPhone={accountPrefs?.phone || undefined}
                        manualHandles={getManualPaymentHandles()}
                        defaults={{
                          fullName: accountPrefs?.displayName || undefined,
                          line1: defaultAddress?.line1,
                          line2: defaultAddress?.line2,
                          city: defaultAddress?.city,
                          state: defaultAddress?.state,
                          postalCode: defaultAddress?.postalCode,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-7 lg:sticky lg:top-24">
                  <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                    Order summary
                  </p>
                  <h2 className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                    Your bag
                  </h2>

                  <ul className="mt-5 space-y-4" role="list">
                    {cart.lines.map((line) => (
                      <li
                        key={line.variantId}
                        className="border-b border-[var(--color-border)] pb-4 text-[var(--scale-sm)] last:border-0 last:pb-0"
                      >
                        <p className="font-[var(--font-display)] uppercase tracking-[0.04em] text-[var(--color-ink)]">
                          {line.productName}{" "}
                          <span className="text-[var(--color-ink-soft)]">× {line.quantity}</span>
                        </p>
                        <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                          {line.weightOrFormat} · {formatPrice(line.unitPriceCents * line.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {pricing ? (
                    <dl className="mt-6 space-y-2.5 border-t border-[var(--color-border)] pt-5 text-[var(--scale-sm)]">
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-ink-soft)]">Subtotal</dt>
                        <dd className="text-[var(--color-ink)]">{formatPrice(pricing.subtotalCents)}</dd>
                      </div>
                      {pricing.discountCents > 0 ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-terp)]">{pricing.discountLabel ?? "Discount"}</dt>
                          <dd className="text-[var(--color-terp)]">−{formatPrice(pricing.discountCents)}</dd>
                        </div>
                      ) : null}
                      {pricing.loyaltyDiscountCents > 0 ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-terp)]">
                            Loyalty ({pricing.loyaltyPointsRedeemed} pts)
                          </dt>
                          <dd className="text-[var(--color-terp)]">
                            −{formatPrice(pricing.loyaltyDiscountCents)}
                          </dd>
                        </div>
                      ) : null}
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-ink-soft)]">{pricing.taxLabel}</dt>
                        <dd className="text-[var(--color-ink)]">{formatPrice(pricing.taxCents)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-ink-soft)]">{pricing.shippingLabel}</dt>
                        <dd className="text-[var(--color-ink)]">{formatPrice(pricing.shippingCents)}</dd>
                      </div>
                      <div className="flex justify-between gap-3 border-t border-[var(--color-border)] pt-4">
                        <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink)]">
                          Total
                        </dt>
                        <dd className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-resin)]">
                          {formatPrice(pricing.totalCents)}
                        </dd>
                      </div>
                    </dl>
                  ) : null}

                  <p className="mt-4 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                    No hidden fees. Every charge is shown before you pay.
                  </p>
                  <Link
                    href="/cart"
                    className="mt-5 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)]"
                  >
                    Edit cart →
                  </Link>
                </aside>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
