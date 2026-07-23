// app/checkout/confirmation/[orderId]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-[var(--font-mono)] text-[var(--scale-xs)] uppercase tracking-wide text-[var(--color-ink-soft)]">
        {paid ? "Payment confirmed" : "Order pending payment"}
      </p>
      <h1 className="mt-2 font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
        {paid ? "Thank you" : "Awaiting payment"}
      </h1>
      <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Order <span className="font-[var(--font-mono)] text-[var(--color-ink)]">{order.id}</span>
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

      <section className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Receipt
        </h2>
        <ul className="mt-4 space-y-2 text-[var(--scale-sm)]" role="list">
          {order.lines.map((line) => (
            <li key={line.variantId} className="flex justify-between gap-4">
              <span className="text-[var(--color-ink)]">
                {line.productName} × {line.quantity}
              </span>
              <span className="font-[var(--font-mono)] text-[var(--color-ink-soft)]">
                {formatPrice(line.unitPriceCents * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-[var(--color-border)] pt-4 text-[var(--scale-sm)]">
          <div className="flex justify-between">
            <dt className="text-[var(--color-ink-soft)]">Subtotal</dt>
            <dd>{formatPrice(order.subtotalCents)}</dd>
          </div>
          {order.discountCents > 0 ? (
            <div className="flex justify-between">
              <dt className="text-[var(--color-terp)]">
                {order.discountLabel ?? "Discount"}
              </dt>
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
          <div className="flex justify-between font-[var(--font-display)] text-[var(--scale-base)]">
            <dt>Total</dt>
            <dd>{formatPrice(order.totalCents)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Ship to {order.address.fullName}, {order.address.line1}, {order.address.city},{" "}
          {order.address.state} {order.address.postalCode}. A confirmation email is sent when Resend is
          configured (dry-run logged locally otherwise).
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/account/orders"
          className="text-[var(--scale-sm)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
        >
          View in account
        </Link>
        <Link
          href="/shop"
          className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
        >
          Continue shopping
        </Link>
        {!paid && order.paymentMode === "mock" ? (
          <Link
            href={`/checkout/mock-pay/${order.id}`}
            className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
          >
            Resume mock payment
          </Link>
        ) : null}
      </div>
    </div>
  );
}
