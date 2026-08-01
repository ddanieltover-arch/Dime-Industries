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

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default async function AccountOrdersPage() {
  const profile = await requireUser();
  const orders = await listOrders({ email: profile.email });

  return (
    <div>
      <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
        Orders
      </h2>
      <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Track payment and shipping for {profile.email}.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          No orders yet.{" "}
          <Link href="/shop" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
            Shop now
          </Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-3" role="list">
          {orders.map((order) => (
            <li key={order.id} className="bg-[var(--color-surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="font-[var(--font-display)] uppercase tracking-[0.04em] text-[var(--color-ink)] hover:text-[var(--color-resin)]"
                  >
                    {order.id}
                  </Link>
                  <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                    {statusLabel(order.status)}
                    {order.trackingNumber ? " · tracking available" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-resin-strong)]">
                    {formatPrice(order.totalCents)}
                  </p>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="mt-2 inline-block nav-link text-[var(--color-ink-muted)] hover:text-[var(--color-resin)]"
                  >
                    Track order
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
