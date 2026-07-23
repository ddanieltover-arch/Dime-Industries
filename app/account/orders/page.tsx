// app/account/orders/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listOrders } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage() {
  const profile = await requireUser();
  const orders = await listOrders({ email: profile.email });

  return (
    <div>
      <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
        Orders
      </h2>
      <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Orders for {profile.email}. With DATABASE_URL configured, history is durable across devices.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          No orders yet.{" "}
          <Link href="/shop" className="text-[var(--color-resin-strong)] underline-offset-4 hover:underline">
            Shop now
          </Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-3" role="list">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="font-[var(--font-mono)] text-[var(--color-ink)] hover:text-[var(--color-resin)]"
                  >
                    {order.id}
                  </Link>
                  <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                    {new Date(order.createdAt).toLocaleString()} · {order.status.replace(/_/g, " ")}
                  </p>
                </div>
                <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
                  {formatPrice(order.totalCents)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
