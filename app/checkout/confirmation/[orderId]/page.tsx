// app/checkout/confirmation/[orderId]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderTrackingPanel } from "@/components/checkout/order-tracking";
import { getOrderById, markOrderPaid } from "@/lib/checkout";
import { persistCartLines } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

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
          : " is still waiting for Bitcoin payment confirmation."}
      </p>
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
            Ship to {order.address.fullName}, {order.address.line1}, {order.address.city},{" "}
            {order.address.state} {order.address.postalCode}.
          </p>
          <p className="mt-2 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
            Payment:{" "}
            {order.paymentMethod === "net_terms"
              ? `${order.paymentTerms?.toUpperCase() ?? "NET"} terms`
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
