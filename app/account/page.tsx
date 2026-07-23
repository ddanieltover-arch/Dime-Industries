// app/account/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listOrders } from "@/lib/checkout";
import { getAccountPrefs } from "@/lib/account/prefs";
import { getWishlistSnapshot } from "@/lib/wishlist";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountDashboardPage() {
  const profile = await requireUser();
  const [orders, prefs, wishlist] = await Promise.all([
    listOrders({ email: profile.email }),
    getAccountPrefs(),
    getWishlistSnapshot(),
  ]);
  const recent = orders.slice(0, 3);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Overview
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Welcome{prefs.displayName ? `, ${prefs.displayName}` : ""}. Manage orders and preferences
          for {profile.email}.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Orders
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
            {orders.length}
          </p>
        </div>
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Wishlist
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
            {wishlist.count}
          </p>
        </div>
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Addresses
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
            {prefs.addresses.length}
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
            Recent orders
          </h2>
          <Link
            href="/account/orders"
            className="text-[var(--scale-sm)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            No orders yet.{" "}
            <Link href="/shop" className="underline-offset-4 hover:underline">
              Browse the shop
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3" role="list">
            {recent.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3"
              >
                <div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="font-[var(--font-mono)] text-[var(--scale-sm)] text-[var(--color-ink)] hover:text-[var(--color-resin)]"
                  >
                    {order.id}
                  </Link>
                  <p className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                    {order.status.replace("_", " ")} · {formatPrice(order.totalCents)}
                  </p>
                </div>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
                >
                  Details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-wrap gap-4 text-[var(--scale-sm)]">
        <Link href="/account/validate" className="text-[var(--color-resin-strong)] underline-offset-4 hover:underline">
          Validate a product
        </Link>
        <Link href="/account/addresses" className="text-[var(--color-ink-soft)] underline-offset-4 hover:underline">
          Manage addresses
        </Link>
      </section>
    </div>
  );
}
