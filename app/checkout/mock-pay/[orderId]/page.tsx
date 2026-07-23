// app/checkout/mock-pay/[orderId]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { completeMockPayment } from "@/app/(commerce)/checkout-actions";
import { getOrderById } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Mock Bitcoin payment",
  robots: { index: false, follow: false },
};

type Params = Promise<{ orderId: string }>;

export default async function MockPayPage({ params }: { params: Params }) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();
  if (order.paymentMode !== "mock") notFound();

  async function pay() {
    "use server";
    await completeMockPayment(orderId);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <p className="font-[var(--font-mono)] text-[var(--scale-xs)] uppercase tracking-wide text-[var(--color-ink-soft)]">
        Paybis mock mode
      </p>
      <h1 className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
        Simulate BTC payment
      </h1>
      <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        No live Paybis keys are configured. Confirm below to mark order{" "}
        <span className="font-[var(--font-mono)] text-[var(--color-ink)]">{order.id}</span> as paid
        for <strong className="text-[var(--color-ink)]">{formatPrice(order.totalCents)}</strong>.
      </p>

      <dl className="mt-8 space-y-2 border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--scale-sm)]">
        <div className="flex justify-between">
          <dt className="text-[var(--color-ink-soft)]">Subtotal</dt>
          <dd>{formatPrice(order.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--color-ink-soft)]">Tax</dt>
          <dd>{formatPrice(order.taxCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--color-ink-soft)]">Shipping</dt>
          <dd>{formatPrice(order.shippingCents)}</dd>
        </div>
        <div className="flex justify-between border-t border-[var(--color-border)] pt-2 font-[var(--font-display)]">
          <dt>Total</dt>
          <dd>{formatPrice(order.totalCents)}</dd>
        </div>
      </dl>

      <form action={pay} className="mt-8 space-y-3">
        <button
          type="submit"
          className="w-full rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-surface)] hover:bg-[var(--color-resin-hover)]"
        >
          Confirm mock payment
        </button>
        <Link
          href="/checkout"
          className="block text-center text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
        >
          Cancel and return to checkout
        </Link>
      </form>
    </div>
  );
}
