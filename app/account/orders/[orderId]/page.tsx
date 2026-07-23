// app/account/orders/[orderId]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getOrderById } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

type Params = Promise<{ orderId: string }>;

export default async function AccountOrderDetailPage({ params }: { params: Params }) {
  await requireUser();
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/account/orders"
        className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
      >
        ← All orders
      </Link>
      <h2 className="mt-4 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
        {order.id}
      </h2>
      <p className="mt-1 font-[var(--font-mono)] text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        {order.status.replace(/_/g, " ")}
        {order.paidAt ? ` · paid ${new Date(order.paidAt).toLocaleString()}` : ""}
      </p>

      <ul className="mt-8 space-y-2" role="list">
        {order.lines.map((line) => (
          <li key={line.variantId} className="flex justify-between gap-4 text-[var(--scale-sm)]">
            <span>
              <Link href={`/product/${line.productSlug}`} className="hover:text-[var(--color-resin)]">
                {line.productName}
              </Link>{" "}
              × {line.quantity}
            </span>
            <span className="font-[var(--font-mono)]">{formatPrice(line.unitPriceCents * line.quantity)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 border-t border-[var(--color-border)] pt-4 text-[var(--scale-sm)]">
        <div className="flex justify-between">
          <dt className="text-[var(--color-ink-soft)]">Subtotal</dt>
          <dd>{formatPrice(order.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--color-ink-soft)]">{order.taxLabel}</dt>
          <dd>{formatPrice(order.taxCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--color-ink-soft)]">{order.shippingLabel}</dt>
          <dd>{formatPrice(order.shippingCents)}</dd>
        </div>
        <div className="flex justify-between font-[var(--font-display)]">
          <dt>Total</dt>
          <dd>{formatPrice(order.totalCents)}</dd>
        </div>
      </dl>

      <p className="mt-6 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Ship to {order.address.fullName}, {order.address.line1}, {order.address.city},{" "}
        {order.address.state} {order.address.postalCode}
      </p>
    </div>
  );
}
