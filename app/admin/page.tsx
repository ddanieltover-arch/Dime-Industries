// app/admin/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminCatalog } from "@/lib/admin/catalog-overrides";
import { listAdminOrders, adminOrderKpis } from "@/lib/admin/orders-admin";
import { listReviews } from "@/lib/admin/reviews-store";
import { getLaunchStatus } from "@/lib/ops/launch-status";
import { formatPrice } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function statusTone(status: string): string {
  if (status === "payment_confirmed") return "border-[var(--color-terp)]/40 text-[var(--color-terp)]";
  if (status === "pending") return "border-[var(--color-resin)]/40 text-[var(--color-resin)]";
  return "border-[var(--color-flag)]/40 text-[var(--color-flag)]";
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [catalog, orders, pendingReviews] = await Promise.all([
    getAdminCatalog(),
    listAdminOrders(),
    listReviews("pending"),
  ]);
  const launch = getLaunchStatus();
  const kpis = adminOrderKpis(orders);
  const activeProducts = catalog.filter((p) => p.status === "active").length;
  const lowStock = catalog.flatMap((p) =>
    p.variants.filter((v) => v.quantityOnHand > 0 && v.quantityOnHand < 30)
  ).length;
  const recent = orders.slice(0, 8);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Sales and ops snapshot. CSV exports live under Reports."
        actions={
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center border px-2.5 py-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] ${
                launch.readyForPublicTraffic
                  ? "border-[var(--color-terp)]/40 text-[var(--color-terp)]"
                  : "border-[var(--color-flag)]/40 text-[var(--color-flag)]"
              }`}
            >
              {launch.readyForPublicTraffic ? "Launch ready" : "Launch blocked"}
            </span>
            {launch.softLaunch ? (
              <span className="inline-flex items-center border border-[var(--color-border-interactive)] px-2.5 py-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                Soft launch
              </span>
            ) : null}
          </div>
        }
      />

      <section>
        <h2 className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
          Sales
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Revenue (paid)", value: formatPrice(kpis.revenueCents) },
            { label: "Paid orders", value: String(kpis.paidCount) },
            { label: "AOV", value: formatPrice(kpis.aovCents) },
            { label: "Pending payment", value: String(kpis.pendingCount) },
          ].map((card) => (
            <div
              key={card.label}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                {card.label}
              </p>
              <p className="mt-3 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)] sm:text-[var(--scale-2xl)]">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
          Catalog &amp; queue
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Active products", value: String(activeProducts) },
            { label: "Pending reviews", value: String(pendingReviews.length) },
            { label: "Low-stock variants", value: String(lowStock) },
          ].map((card) => (
            <div
              key={card.label}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                {card.label}
              </p>
              <p className="mt-3 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 sm:px-5">
            <h2 className="font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] underline-offset-4 hover:underline"
            >
              See all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-4 py-8 text-[var(--scale-sm)] text-[var(--color-ink-soft)] sm:px-5">
              No orders in this session yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-[var(--scale-sm)]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-ink-muted)]">
                    <th className="px-4 py-3 font-[var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.14em] sm:px-5">
                      Order
                    </th>
                    <th className="px-4 py-3 font-[var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.14em]">
                      Customer
                    </th>
                    <th className="px-4 py-3 font-[var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.14em]">
                      Total
                    </th>
                    <th className="px-4 py-3 font-[var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.14em]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((order) => (
                    <tr key={order.id} className="border-b border-[var(--color-border)] last:border-b-0">
                      <td className="px-4 py-3 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink)] sm:px-5">
                        {order.id.slice(0, 12)}
                        {order.id.length > 12 ? "…" : ""}
                      </td>
                      <td className="max-w-[12rem] truncate px-4 py-3 text-[var(--color-ink-soft)]">
                        {order.email}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-ink)]">{formatPrice(order.totalCents)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex border px-2 py-0.5 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] ${statusTone(order.status)}`}
                        >
                          {order.status.replaceAll("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-4 py-3 sm:px-5">
            <h2 className="font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Queues
            </h2>
          </div>
          <ul className="divide-y divide-[var(--color-border)]" role="list">
            {[
              {
                href: "/admin/orders",
                label: "Pending payments",
                value: String(kpis.pendingCount),
              },
              {
                href: "/admin/inventory",
                label: "Low-stock variants",
                value: String(lowStock),
              },
              {
                href: "/admin/reviews",
                label: "Reviews to moderate",
                value: String(pendingReviews.length),
              },
              { href: "/admin/reports", label: "Reports (CSV)", value: "→" },
              { href: "/admin/settings", label: "Settings", value: "→" },
              { href: "/admin/launch", label: "Launch checklist", value: "→" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 text-[var(--scale-sm)] transition hover:bg-[color-mix(in_srgb,var(--color-resin)_6%,transparent)] sm:px-5"
                >
                  <span className="text-[var(--color-ink-soft)]">{item.label}</span>
                  <span className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-resin)]">
                    {item.value}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
