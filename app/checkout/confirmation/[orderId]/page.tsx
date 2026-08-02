// app/checkout/confirmation/[orderId]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderTrackingPanel } from "@/components/checkout/order-tracking";
import { getOrderById, markOrderPaid } from "@/lib/checkout";
import { persistCartLines } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import {
  getManualPaymentHandles,
  isManualPaymentMethod,
  manualPaymentHint,
  paymentMethodLabel,
} from "@/lib/payments/methods";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

type Params = Promise<{ orderId: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orderId } = await params;
  const sp = await searchParams;
  let order = await getOrderById(orderId);
  if (!order) notFound();

  // Live Paybis success return may land here before webhook; treat ?paid=1 as
  // client return signal. Authoritative confirmation is the Paybis webhook when
  // orders are in database mode.
  if (sp.paid === "1" && order.status === "pending" && order.paymentMode === "live") {
    order = (await markOrderPaid(orderId)) ?? order;
    await persistCartLines([]);
  }

  const paid = order.status === "payment_confirmed";
  const methodLabel = paymentMethodLabel(order.paymentMethod);
  const manualMethod = isManualPaymentMethod(order.paymentMethod)
    ? order.paymentMethod
    : null;
  const isManual = Boolean(manualMethod);
  const isBitcoin = order.paymentMethod === "paybis_btc";
  const paymentReported = sp.reported === "1";
  const manualHandle = manualMethod
    ? getManualPaymentHandles()[manualMethod]
    : undefined;

  return (
    <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-16 lg:py-20">
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
        {paid ? "Payment confirmed" : "Order pending payment"}
      </p>
      <h1 className="section-title mt-3">{paid ? "Thank you" : "Awaiting payment"}</h1>
      <p className="mt-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Order <span className="text-[var(--color-ink)]">{order.id}</span>
        {paid
          ? order.paymentMethod === "net_terms"
            ? ` is accepted on ${order.paymentTerms?.toUpperCase() ?? "NET"} terms.`
            : " is confirmed."
          : isManual
            ? ` is reserved — complete ${methodLabel} payment to confirm.`
            : paymentReported
              ? " — thanks. We were notified and will verify your Bitcoin payment shortly."
              : " is still waiting for Bitcoin payment confirmation."}
      </p>
      {!paid && isBitcoin ? (
        <div className="mt-6 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          <p>
            {paymentReported
              ? "Our team will approve your order once the Bitcoin transfer is confirmed."
              : "Send Bitcoin to our wallet, then click I have paid on the payment page."}
          </p>
          <Link
            href={`/checkout/bitcoin/${order.id}`}
            className="mt-4 inline-flex btn-primary"
          >
            {paymentReported ? "View payment instructions" : "Open Bitcoin payment page"}
          </Link>
        </div>
      ) : null}
      {!paid && isManual ? (
        <div className="mt-6 border border-[var(--color-resin)] bg-[rgba(201,177,56,0.08)] p-5 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
            {methodLabel} instructions
          </p>
          <p className="mt-3">{manualMethod ? manualPaymentHint(manualMethod) : null}</p>
          {manualHandle ? (
            <p className="mt-2 text-[var(--color-ink)]">
              Send{" "}
              <span className="text-[var(--color-resin)]">{formatPrice(order.totalCents)}</span> to{" "}
              <span className="font-[var(--font-display)] tracking-[0.04em] text-[var(--color-resin)]">
                {manualHandle}
              </span>
            </p>
          ) : (
            <p className="mt-2">
              Send{" "}
              <span className="text-[var(--color-resin)]">{formatPrice(order.totalCents)}</span> via{" "}
              {methodLabel}. Check your email or contact support if you need the destination handle.
            </p>
          )}
          <p className="mt-2 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
            Include order ID <span className="text-[var(--color-ink)]">{order.id}</span> in the
            payment note.
          </p>
        </div>
      ) : null}
      {order.channel === "wholesale" ? (
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Wholesale order
          {order.wholesaleBusinessName ? ` · ${order.wholesaleBusinessName}` : ""}.
        </p>
      ) : null}

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <OrderTrackingPanel order={order} />

        <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
            Receipt
          </h2>
          <ul className="mt-5 space-y-3 text-[var(--scale-sm)]" role="list">
            {order.lines.map((line) => (
              <li key={line.variantId} className="flex justify-between gap-4">
                <span className="text-[var(--color-ink)]">
                  {line.productName} × {line.quantity}
                </span>
                <span className="text-[var(--color-ink-soft)]">
                  {formatPrice(line.unitPriceCents * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2.5 border-t border-[var(--color-border)] pt-4 text-[var(--scale-sm)]">
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-soft)]">Subtotal</dt>
              <dd>{formatPrice(order.subtotalCents)}</dd>
            </div>
            {order.discountCents > 0 ? (
              <div className="flex justify-between">
                <dt className="text-[var(--color-terp)]">{order.discountLabel ?? "Discount"}</dt>
                <dd className="text-[var(--color-terp)]">−{formatPrice(order.discountCents)}</dd>
              </div>
            ) : null}
            {(order.loyaltyDiscountCents ?? 0) > 0 ? (
              <div className="flex justify-between">
                <dt className="text-[var(--color-terp)]">
                  Loyalty ({order.loyaltyPointsRedeemed ?? 0} pts)
                </dt>
                <dd className="text-[var(--color-terp)]">
                  −{formatPrice(order.loyaltyDiscountCents ?? 0)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-soft)]">{order.taxLabel}</dt>
              <dd>{formatPrice(order.taxCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-soft)]">{order.shippingLabel}</dt>
              <dd>{formatPrice(order.shippingCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 font-[var(--font-display)] text-[var(--scale-base)]">
              <dt>Total</dt>
              <dd className="text-[var(--color-resin-strong)]">{formatPrice(order.totalCents)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
            Ship to {order.address.fullName}
            {order.address.phone ? `, ${order.address.phone}` : ""}, {order.address.line1},{" "}
            {order.address.city}, {order.address.state} {order.address.postalCode}
            {order.address.country
              ? `, ${order.address.country === "US" ? "United States" : order.address.country}`
              : ""}
            .
          </p>
          <p className="mt-2 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
            Payment:{" "}
            {order.paymentMethod === "net_terms"
              ? `${order.paymentTerms?.toUpperCase() ?? "NET"} terms`
              : isManual
                ? methodLabel
                : `Bitcoin (${order.paymentMode ?? "pending"})`}
            . A confirmation email is sent when Resend is configured.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link href={`/account/orders/${order.id}`} className="btn-primary">
          Track in account
        </Link>
        <Link href="/shop" className="btn-outline">
          Continue shopping
        </Link>
        {!paid && order.paymentMode === "mock" ? (
          <Link
            href={`/checkout/mock-pay/${order.id}`}
            className="nav-link self-center text-[var(--color-ink-soft)]"
          >
            Resume mock payment
          </Link>
        ) : null}
      </div>
    </div>
  );
}
