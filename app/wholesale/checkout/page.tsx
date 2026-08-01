// app/wholesale/checkout/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { WholesaleCheckoutForm } from "@/components/wholesale/checkout-form";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { computePricing } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import {
  getWholesaleCartSnapshot,
  requireWholesaleBuyer,
  termsLabel,
  WHOLESALE_MIN_ORDER_CENTS,
} from "@/lib/wholesale";

export const metadata: Metadata = {
  title: "Wholesale checkout",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function WholesaleCheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  let buyer;
  try {
    buyer = await requireWholesaleBuyer();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "AUTH_REQUIRED") redirect("/login?next=/wholesale/checkout");
    redirect("/wholesale");
  }

  const gate = await getAgeGateState();
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
      console.warn("[wholesale/checkout] payment_failed inventory release failed", err);
    }
  }

  const cart = await getWholesaleCartSnapshot();
  const checkoutJurisdiction = gate.jurisdiction ?? "CA";
  const pricing = gate.ageVerified
    ? computePricing(cart.lines, checkoutJurisdiction, null)
    : null;

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-16 text-center">
        <h1 className="section-title">Wholesale checkout</h1>
        <p className="mt-4 text-[var(--color-ink-soft)]">Your wholesale cart is empty.</p>
        <Link href="/wholesale/shop" className="btn-primary mt-8">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-[var(--container-pad-x)] py-10 lg:grid-cols-[1fr_22rem] lg:py-14">
      <div>
        <header className="border-b border-[var(--color-border)] pb-8">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            B2B
          </p>
          <h1 className="section-title mt-2">Wholesale checkout</h1>
          <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            {buyer.account.businessName} · default {termsLabel(buyer.account.defaultPaymentTerms)}
          </p>
          {paymentError ? (
            <p role="alert" className="mt-4 text-[var(--scale-sm)] text-[var(--color-flag)]">
              Payment was not completed. You can retry or switch to NET terms.
            </p>
          ) : null}
          {cart.subtotalCents < WHOLESALE_MIN_ORDER_CENTS ? (
            <p role="alert" className="mt-4 text-[var(--scale-sm)] text-[var(--color-flag)]">
              Minimum order is {formatPrice(WHOLESALE_MIN_ORDER_CENTS)}.
            </p>
          ) : null}
        </header>
        <div className="mt-8">
          <WholesaleCheckoutForm
            email={buyer.email}
            jurisdiction={checkoutJurisdiction}
            defaultTerms={buyer.account.defaultPaymentTerms}
            pricing={pricing}
          />
        </div>
      </div>
      <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
          Summary
        </h2>
        <ul className="mt-5 space-y-3 text-[var(--scale-sm)]">
          {cart.lines.map((l) => (
            <li key={l.variantId} className="flex justify-between gap-2">
              <span>
                {l.productName} × {l.quantity}
              </span>
              <span>{formatPrice(l.quantity * l.unitPriceCents)}</span>
            </li>
          ))}
        </ul>
        {pricing ? (
          <dl className="mt-5 space-y-2 border-t border-[var(--color-border)] pt-4 text-[var(--scale-sm)]">
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-soft)]">Subtotal</dt>
              <dd>{formatPrice(pricing.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-soft)]">Tax</dt>
              <dd>{formatPrice(pricing.taxCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-soft)]">Shipping</dt>
              <dd>{formatPrice(pricing.shippingCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 font-[var(--font-display)]">
              <dt>Total</dt>
              <dd className="text-[var(--color-resin-strong)]">{formatPrice(pricing.totalCents)}</dd>
            </div>
          </dl>
        ) : null}
      </aside>
    </div>
  );
}
