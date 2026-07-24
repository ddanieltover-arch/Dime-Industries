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
  const pricing =
    ageGate.ageVerified && ageGate.jurisdiction
      ? computePricing(cart.lines, ageGate.jurisdiction, coupon, loyalty)
      : null;

  return (
    <>
      <AgeGateDialog initiallyOpen={!ageGate.ageVerified} />

      {!ageGate.ageVerified || !ageGate.jurisdiction ? null : cart.lines.length === 0 ? (
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
            Checkout
          </h1>
          <p className="mt-4 text-[var(--color-ink-soft)]">Your cart is empty.</p>
          <Link
            href="/shop"
            className="mt-6 inline-block text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
          >
            Return to shop
          </Link>
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1fr_20rem] sm:px-6 lg:px-8">
          <div>
            <h1 className="font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
              Checkout
            </h1>
            {!isPaybisLiveConfigured() ? (
              <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                Paybis credentials are not configured — checkout will use the mock Bitcoin payment flow.
              </p>
            ) : null}
            {paymentError ? (
              <p role="alert" className="mt-4 text-[var(--scale-sm)] text-[var(--color-flag)]">
                Payment was not completed. You can try again below.
              </p>
            ) : null}
            <div className="mt-6">
              <CouponForm appliedCode={pricing?.couponCode ?? null} />
            </div>
            {profile ? (
              <div className="mt-4">
                <LoyaltyRedeemForm
                  balance={balance}
                  appliedPoints={pricing?.loyaltyPointsRedeemed ?? 0}
                  appliedDiscountCents={pricing?.loyaltyDiscountCents ?? 0}
                />
              </div>
            ) : (
              <p className="mt-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                <Link href="/login?next=/checkout" className="underline underline-offset-4">
                  Sign in
                </Link>{" "}
                to redeem loyalty points.
              </p>
            )}
            <div className="mt-8">
              <CheckoutForm
                jurisdiction={ageGate.jurisdiction}
                pricing={pricing!}
                defaultEmail={profile?.email}
              />
            </div>
          </div>

          <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
              Items
            </h2>
            <ul className="mt-4 space-y-3" role="list">
              {cart.lines.map((line) => (
                <li key={line.variantId} className="text-[var(--scale-sm)]">
                  <p className="text-[var(--color-ink)]">
                    {line.productName}{" "}
                    <span className="text-[var(--color-ink-soft)]">× {line.quantity}</span>
                  </p>
                  <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                    {line.weightOrFormat} · {formatPrice(line.unitPriceCents * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
              <Link href="/cart" className="underline-offset-4 hover:underline">
                Edit cart
              </Link>
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
