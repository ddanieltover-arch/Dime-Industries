// app/checkout/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { CouponForm } from "@/components/cart/coupon-form";
import { LoyaltyRedeemForm } from "@/components/checkout/loyalty-redeem-form";
import { getCartSnapshot } from "@/lib/cart";
import { computePricing } from "@/lib/checkout";
import { resolveAppliedCoupon } from "@/lib/coupons/store";
import { isPaybisLiveConfigured } from "@/lib/payments";
import { formatPrice } from "@/lib/format";
import { getCurrentProfile } from "@/lib/auth/session";

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
      const { releaseInventoryForOrder } = await import("@/lib/inventory");
      const orders = getOrderRepository();
      const order = await orders.getById(failedOrderId);
      if (order?.status === "pending") {
        await orders.update(order.id, { status: "cancelled" });
        await releaseInventoryForOrder(order.id);
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

      {!ageGate.ageVerified ? null : cart.lines.length === 0 ? (
        <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-20 text-center">
          <h1 className="section-title">Checkout</h1>
          <p className="mt-4 text-[var(--color-ink-soft)]">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary mt-8">
            Return to shop
          </Link>
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl gap-12 px-[var(--container-pad-x)] py-10 lg:grid-cols-[1fr_22rem] lg:py-14">
          <div>
            <header className="border-b border-[var(--color-border)] pb-8">
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
                Secure checkout
              </p>
              <h1 className="section-title mt-2">Checkout</h1>
              {!isPaybisLiveConfigured() ? (
                <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  Paybis credentials are not configured — checkout will use the mock Bitcoin payment flow.
                </p>
              ) : null}
              {paymentError ? (
                <p role="alert" className="mt-4 text-[var(--scale-sm)] text-[var(--color-flag)]">
                  Payment was not completed. You can try again below.
                </p>
              ) : null}
            </header>

            <div className="mt-8 space-y-4">
              <CouponForm appliedCode={pricing?.couponCode ?? null} />
              {profile ? (
                <LoyaltyRedeemForm
                  balance={balance}
                  appliedPoints={pricing?.loyaltyPointsRedeemed ?? 0}
                  appliedDiscountCents={pricing?.loyaltyDiscountCents ?? 0}
                />
              ) : (
                <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  <Link href="/login?next=/checkout" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
                    Sign in
                  </Link>{" "}
                  to redeem loyalty points.
                </p>
              )}
            </div>

            <div className="mt-10">
              <CheckoutForm
                jurisdiction={checkoutJurisdiction}
                pricing={pricing!}
                defaultEmail={profile?.email}
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

          <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              Items
            </h2>
            <ul className="mt-5 space-y-4" role="list">
              {cart.lines.map((line) => (
                <li key={line.variantId} className="border-b border-[var(--color-border)] pb-4 text-[var(--scale-sm)] last:border-0 last:pb-0">
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
            <p className="mt-5">
              <Link
                href="/cart"
                className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] hover:text-[var(--color-resin)]"
              >
                Edit cart
              </Link>
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
