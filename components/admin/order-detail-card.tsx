// components/admin/order-detail-card.tsx
import type { CheckoutOrder } from "@/lib/checkout/types";
import { shippingCountryName } from "@/lib/checkout/countries";
import { paymentMethodLabel } from "@/lib/payments/methods";
import { formatPrice } from "@/lib/format";
import { OrderStatusForm } from "@/components/admin/order-status-form";

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[var(--scale-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink)]">{children}</dd>
    </div>
  );
}

export function OrderDetailCard({ order }: { order: CheckoutOrder }) {
  const address = order.address;
  const country = shippingCountryName(address.country || "US");
  const channel = order.channel === "wholesale" ? "Wholesale" : "Retail";
  const paymentTerms =
    order.paymentTerms === "net30"
      ? "NET-30"
      : order.paymentTerms === "net60"
        ? "NET-60"
        : order.paymentTerms === "upfront"
          ? "Upfront"
          : null;

  return (
    <li className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <details className="group min-w-0 flex-1">
          <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-[var(--font-mono)] text-[var(--color-ink)]">{order.id}</p>
              <span className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-0.5 text-[var(--scale-xs)] uppercase tracking-[0.08em] text-[var(--color-ink-soft)]">
                {order.status.replace(/_/g, " ")}
              </span>
              <span className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">{channel}</span>
              <span
                aria-hidden
                className="text-[var(--scale-sm)] text-[var(--color-resin)] transition group-open:rotate-180"
              >
                ▾
              </span>
            </div>
            <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              {address.fullName || order.email} · {order.email}
              {address.phone ? ` · ${address.phone}` : ""} · {order.jurisdiction} ·{" "}
              {formatPrice(order.totalCents)}
            </p>
            <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
              {new Date(order.createdAt).toLocaleString()} · {order.lines.length} line(s) · Click to
              expand full details
            </p>
          </summary>

          <div className="mt-5 space-y-6 border-t border-[var(--color-border)] pt-5">
            <section>
              <h3 className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-resin)]">
                Customer
              </h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Name">{address.fullName || "—"}</Detail>
                <Detail label="Email">
                  <a
                    href={`mailto:${order.email}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {order.email}
                  </a>
                </Detail>
                <Detail label="Phone">
                  {address.phone ? (
                    <a href={`tel:${address.phone}`} className="underline-offset-2 hover:underline">
                      {address.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </Detail>
              </dl>
            </section>

            <section>
              <h3 className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-resin)]">
                Shipping address
              </h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                <Detail label="Street">
                  {address.line1 || "—"}
                  {address.line2 ? (
                    <>
                      <br />
                      {address.line2}
                    </>
                  ) : null}
                </Detail>
                <Detail label="City / State / ZIP">
                  {[address.city, address.state, address.postalCode].filter(Boolean).join(", ") ||
                    "—"}
                </Detail>
                <Detail label="Country">{country}</Detail>
                <Detail label="Catalog jurisdiction">{order.jurisdiction}</Detail>
              </dl>
            </section>

            <section>
              <h3 className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-resin)]">
                Payment & fulfillment
              </h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Payment method">{paymentMethodLabel(order.paymentMethod)}</Detail>
                <Detail label="Payment terms">{paymentTerms || "—"}</Detail>
                <Detail label="Payment mode">{order.paymentMode || "—"}</Detail>
                <Detail label="Payment request ID">
                  <span className="break-all font-[var(--font-mono)] text-[var(--scale-xs)]">
                    {order.paymentRequestId || "—"}
                  </span>
                </Detail>
                <Detail label="Paid at">
                  {order.paidAt ? new Date(order.paidAt).toLocaleString() : "Not paid"}
                </Detail>
                {order.wholesaleBusinessName ? (
                  <Detail label="Wholesale business">{order.wholesaleBusinessName}</Detail>
                ) : null}
                {order.carrier || order.trackingNumber ? (
                  <>
                    <Detail label="Carrier">{order.carrier || "—"}</Detail>
                    <Detail label="Tracking">
                      {order.trackingUrl ? (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline-offset-2 hover:underline"
                        >
                          {order.trackingNumber || order.trackingUrl}
                        </a>
                      ) : (
                        order.trackingNumber || "—"
                      )}
                    </Detail>
                  </>
                ) : null}
              </dl>
            </section>

            <section>
              <h3 className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-resin)]">
                Line items
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[32rem] text-left text-[var(--scale-sm)]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[var(--scale-xs)] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
                      <th className="py-2 pr-3 font-normal">Product</th>
                      <th className="py-2 pr-3 font-normal">SKU</th>
                      <th className="py-2 pr-3 font-normal">Qty</th>
                      <th className="py-2 pr-3 font-normal">Unit</th>
                      <th className="py-2 font-normal">Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lines.map((line) => (
                      <tr
                        key={`${line.variantId}-${line.sku}`}
                        className="border-b border-[var(--color-border)] text-[var(--color-ink)]"
                      >
                        <td className="py-2.5 pr-3">
                          <span className="block">{line.productName}</span>
                          <span className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                            {line.lineName}
                            {line.weightOrFormat ? ` · ${line.weightOrFormat}` : ""}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                          {line.sku}
                        </td>
                        <td className="py-2.5 pr-3">{line.quantity}</td>
                        <td className="py-2.5 pr-3">{formatPrice(line.unitPriceCents)}</td>
                        <td className="py-2.5">
                          {formatPrice(line.unitPriceCents * line.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-resin)]">
                Totals
              </h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Subtotal">{formatPrice(order.subtotalCents)}</Detail>
                {(order.discountCents ?? 0) > 0 ? (
                  <Detail label={order.discountLabel || "Discount"}>
                    −{formatPrice(order.discountCents)}
                    {order.couponCode ? ` (${order.couponCode})` : ""}
                  </Detail>
                ) : null}
                {(order.loyaltyDiscountCents ?? 0) > 0 ? (
                  <Detail label="Loyalty">
                    −{formatPrice(order.loyaltyDiscountCents!)}
                    {order.loyaltyPointsRedeemed
                      ? ` (${order.loyaltyPointsRedeemed} pts)`
                      : ""}
                  </Detail>
                ) : null}
                <Detail label={order.shippingLabel || "Shipping"}>
                  {formatPrice(order.shippingCents)}
                </Detail>
                <Detail label={order.taxLabel || "Tax"}>{formatPrice(order.taxCents)}</Detail>
                <Detail label="Total">
                  <strong>{formatPrice(order.totalCents)}</strong>
                </Detail>
              </dl>
            </section>
          </div>
        </details>

        <OrderStatusForm orderId={order.id} status={order.status} />
      </div>
    </li>
  );
}
