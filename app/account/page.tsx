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

const QUICK_LINKS = [
  { href: "/account/profile", label: "Edit profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/notifications", label: "Notifications" },
  { href: "/account/validate", label: "Validate" },
  { href: "/account/loyalty", label: "Loyalty" },
  { href: "/wishlist", label: "Wishlist" },
] as const;

export default async function AccountDashboardPage() {
  const profile = await requireUser();
  const [orders, prefs, wishlist] = await Promise.all([
    listOrders({ email: profile.email }),
    getAccountPrefs(),
    getWishlistSnapshot(),
  ]);
  const recent = orders.slice(0, 3);

  return (
    <div className="space-y-8 sm:space-y-10">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Overview
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Welcome{prefs.displayName ? `, ${prefs.displayName}` : ""}. Manage orders and preferences
          for {profile.email}.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        <Link
          href="/account/orders"
          className="min-h-[5.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors touch-manipulation hover:border-[var(--color-resin)] sm:p-4"
        >
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Orders
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)] sm:text-[var(--scale-2xl)]">
            {orders.length}
          </p>
        </Link>
        <Link
          href="/wishlist"
          className="min-h-[5.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors touch-manipulation hover:border-[var(--color-resin)] sm:p-4"
        >
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Wishlist
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)] sm:text-[var(--scale-2xl)]">
            {wishlist.count}
          </p>
        </Link>
        <Link
          href="/account/addresses"
          className="min-h-[5.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors touch-manipulation hover:border-[var(--color-resin)] sm:p-4"
        >
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Addresses
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)] sm:text-[var(--scale-2xl)]">
            {prefs.addresses.length}
          </p>
        </Link>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
            Recent orders
          </h2>
          <Link
            href="/account/orders"
            className="inline-flex min-h-11 items-center text-[var(--scale-sm)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
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
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex min-h-14 flex-wrap items-center justify-between gap-2 border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 transition-colors touch-manipulation hover:border-[var(--color-resin)]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-[var(--font-mono)] text-[var(--scale-sm)] text-[var(--color-ink)]">
                      {order.id}
                    </p>
                    <p className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                      {order.status.replace("_", " ")} · {formatPrice(order.totalCents)}
                    </p>
                  </div>
                  <span className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">Details</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Quick links">
        <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
          Quick links
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" role="list">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex min-h-12 items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-center font-[var(--font-display)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-soft)] transition-colors touch-manipulation hover:border-[var(--color-resin)] hover:text-[var(--color-resin)]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
