// components/checkout/order-tracking.tsx
import Link from "next/link";
import type { CheckoutOrder } from "@/lib/checkout/types";
import { POINTS_PER_DOLLAR } from "@/lib/loyalty/constants";

type Step = {
  id: string;
  label: string;
  detail: string;
  state: "done" | "current" | "upcoming" | "cancelled";
};

function buildSteps(order: CheckoutOrder): Step[] {
  if (order.status === "cancelled" || order.status === "rejected") {
    return [
      {
        id: "placed",
        label: "Order placed",
        detail: new Date(order.createdAt).toLocaleString(),
        state: "done",
      },
      {
        id: "closed",
        label: order.status === "rejected" ? "Order rejected" : "Order cancelled",
        detail: "This order will not ship.",
        state: "cancelled",
      },
    ];
  }

  const paid = order.status === "payment_confirmed";
  const shipped = Boolean(order.shippedAt || order.trackingNumber);
  const isNet = order.paymentMethod === "net_terms";

  return [
    {
      id: "placed",
      label: "Order placed",
      detail: new Date(order.createdAt).toLocaleString(),
      state: "done",
    },
    {
      id: "payment",
      label: isNet ? "Terms accepted" : "Payment",
      detail: paid
        ? order.paidAt
          ? `Confirmed ${new Date(order.paidAt).toLocaleString()}`
          : isNet
            ? `${order.paymentTerms?.toUpperCase() ?? "NET"} invoice`
            : "Bitcoin confirmed"
        : isNet
          ? "Awaiting terms confirmation"
          : "Awaiting Bitcoin confirmation",
      state: paid ? "done" : "current",
    },
    {
      id: "fulfillment",
      label: shipped ? "Shipped" : "Preparing",
      detail: shipped
        ? order.shippedAt
          ? `Shipped ${new Date(order.shippedAt).toLocaleString()}`
          : "In transit"
        : paid
          ? "Licensed fulfillment is preparing your order"
          : "Starts after payment clears",
      state: shipped ? "done" : paid ? "current" : "upcoming",
    },
    {
      id: "delivery",
      label: "Out for delivery",
      detail: shipped
        ? "Track below for carrier updates"
        : "Tracking appears when the carrier scans your package",
      state: shipped ? "current" : "upcoming",
    },
  ];
}

export function OrderTrackingPanel({ order }: { order: CheckoutOrder }) {
  const steps = buildSteps(order);
  const paid = order.status === "payment_confirmed";
  const pointsEstimate = Math.floor(order.totalCents / 100) * POINTS_PER_DOLLAR;

  return (
    <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6" aria-labelledby="tracking-heading">
      <h2
        id="tracking-heading"
        className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]"
      >
        Order status
      </h2>

      <ol className="mt-6 space-y-0" role="list">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const dotClass =
            step.state === "done"
              ? "bg-[var(--color-resin)]"
              : step.state === "current"
                ? "bg-[var(--color-resin)] ring-4 ring-[var(--color-resin)]/25"
                : step.state === "cancelled"
                  ? "bg-[var(--color-flag)]"
                  : "bg-[var(--color-border-interactive)]";
          const labelClass =
            step.state === "upcoming"
              ? "text-[var(--color-ink-muted)]"
              : step.state === "cancelled"
                ? "text-[var(--color-flag)]"
                : "text-[var(--color-ink)]";

          return (
            <li key={step.id} className="flex gap-4">
              <div className="flex w-4 flex-col items-center">
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
                {!isLast ? (
                  <span className="mt-1 w-px flex-1 bg-[var(--color-border)]" aria-hidden="true" />
                ) : null}
              </div>
              <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                <p className={`font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.08em] ${labelClass}`}>
                  {step.label}
                </p>
                <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {order.trackingNumber || order.trackingUrl || order.carrier ? (
        <div className="mt-6 border-t border-[var(--color-border)] pt-5">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Shipment tracking
          </p>
          <dl className="mt-3 space-y-2 text-[var(--scale-sm)]">
            {order.carrier ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-ink-soft)]">Carrier</dt>
                <dd className="text-[var(--color-ink)]">{order.carrier}</dd>
              </div>
            ) : null}
            {order.trackingNumber ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-ink-soft)]">Tracking #</dt>
                <dd className="font-[var(--font-mono)] text-[var(--color-ink)]">{order.trackingNumber}</dd>
              </div>
            ) : null}
          </dl>
          {order.trackingUrl ? (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-4"
            >
              Track package
            </a>
          ) : null}
        </div>
      ) : paid ? (
        <p className="mt-6 border-t border-[var(--color-border)] pt-5 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
          Tracking details appear here once your order ships. You can always find this order in{" "}
          <Link href={`/account/orders/${order.id}`} className="text-[var(--color-resin)] underline-offset-4 hover:underline">
            your account
          </Link>
          .
        </p>
      ) : null}

      {paid && order.channel !== "wholesale" && pointsEstimate > 0 ? (
        <p className="mt-4 text-[var(--scale-xs)] text-[var(--color-resin)]">
          Loyalty: about {pointsEstimate} pts earned on this order (1 pt per $1).
        </p>
      ) : null}
    </section>
  );
}
