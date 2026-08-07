// app/account/orders/[orderId]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderTrackingPanel } from "@/components/checkout/order-tracking";
import { ReturnRequestForm } from "@/components/account/return-request-form";
import { ReturnStatusCard } from "@/components/account/return-status-card";
import { requireUser } from "@/lib/auth/session";
import { getOrderById } from "@/lib/checkout";
import { shippingCountryName } from "@/lib/checkout/countries";
import { formatPrice } from "@/lib/format";
import { getReturnByOrderId } from "@/lib/returns/store";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

type Params = Promise<{ orderId: string }>;

export default async function AccountOrderDetailPage({ params }: { params: Params }) {
  const profile = await requireUser();
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order || order.email.toLowerCase() !== profile.email.toLowerCase()) notFound();

  const existingReturn = await getReturnByOrderId(order.id);
  const canRequestReturn =
    order.status === "payment_confirmed" &&
    (!existingReturn || existingReturn.status === "denied");

  return (
    <div>
      <Link
        href="/account/orders"
        className="nav-link inline-flex min-h-11 items-center text-[var(--color-ink-muted)] hover:text-[var(--color-resin)]"
      >
        ← All orders
      </Link>
      <p className="mt-6 font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
        Order detail
      </p>
      <h2 className="section-title mt-2">{order.id}</h2>
      <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Placed {new Date(order.createdAt).toLocaleString()}
        {order.paidAt ? ` · paid ${new Date(order.paidAt).toLocaleString()}` : ""}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <OrderTrackingPanel order={order} />

        <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h3 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
            Receipt
          </h3>
          <ul className="mt-5 space-y-3 text-[var(--scale-sm)]" role="list">
            {order.lines.map((line) => (
              <li key={line.variantId} className="flex justify-between gap-4">
                <span>
                  <Link href={`/product/${line.productSlug}`} className="hover:text-[var(--color-resin)]">
                    {line.productName}
                  </Link>{" "}
                  × {line.quantity}
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
            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 font-[var(--font-display)]">
              <dt>Total</dt>
              <dd className="text-[var(--color-resin-strong)]">{formatPrice(order.totalCents)}</dd>
            </div>
          </dl>

          <p className="mt-5 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Ship to {order.address.fullName}
            {order.address.phone ? `, ${order.address.phone}` : ""}, {order.address.line1},{" "}
            {order.address.city}, {order.address.state} {order.address.postalCode}
            {order.address.country ? `, ${shippingCountryName(order.address.country)}` : ""}
          </p>
        </section>
      </div>

      <div className="mt-8 max-w-xl space-y-6">
        {existingReturn ? <ReturnStatusCard request={existingReturn} /> : null}
        {canRequestReturn ? <ReturnRequestForm orderId={order.id} /> : null}
      </div>
    </div>
  );
}
