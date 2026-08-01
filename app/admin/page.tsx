// app/admin/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminCatalog } from "@/lib/admin/catalog-overrides";
import { listAdminOrders, adminOrderKpis } from "@/lib/admin/orders-admin";
import { listReviews } from "@/lib/admin/reviews-store";
import { getLaunchStatus } from "@/lib/ops/launch-status";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

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

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Dashboard
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Sales and ops KPIs only — no separate analytics product. CSV exports live under{" "}
          <Link href="/admin/reports" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
            Reports
          </Link>
          .
        </p>
        <p className="mt-3 text-[var(--scale-sm)]">
          <Link
            href="/admin/launch"
            className={
              launch.readyForPublicTraffic
                ? "text-[var(--color-terp)] underline-offset-4 hover:underline"
                : "text-[var(--color-flag)] underline-offset-4 hover:underline"
            }
          >
            Launch status: {launch.readyForPublicTraffic ? "ready" : "blocked"}
            {launch.softLaunch ? " · soft launch" : ""} →
          </Link>
        </p>
      </section>

      <section>
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Sales
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Revenue (paid)", value: formatPrice(kpis.revenueCents) },
            { label: "Paid orders", value: String(kpis.paidCount) },
            { label: "AOV", value: formatPrice(kpis.aovCents) },
            { label: "Pending payment", value: String(kpis.pendingCount) },
          ].map((card) => (
            <div key={card.label} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                {card.label}
              </p>
              <p className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Catalog &amp; queue
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Active products", value: String(activeProducts) },
            { label: "Pending reviews", value: String(pendingReviews.length) },
            { label: "Low-stock variants", value: String(lowStock) },
          ].map((card) => (
            <div key={card.label} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                {card.label}
              </p>
              <p className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3 text-[var(--scale-sm)]">
        <Link href="/admin/orders" className="border border-[var(--color-border)] p-4 hover:bg-[var(--color-surface)]">
          {kpis.pendingCount} pending payments →
        </Link>
        <Link href="/admin/inventory" className="border border-[var(--color-border)] p-4 hover:bg-[var(--color-surface)]">
          {lowStock} low-stock variants →
        </Link>
        <Link href="/admin/reviews" className="border border-[var(--color-border)] p-4 hover:bg-[var(--color-surface)]">
          Moderate reviews →
        </Link>
        <Link href="/admin/reports" className="border border-[var(--color-border)] p-4 hover:bg-[var(--color-surface)]">
          Reports (CSV) →
        </Link>
        <Link href="/admin/settings" className="border border-[var(--color-border)] p-4 hover:bg-[var(--color-surface)]">
          Settings →
        </Link>
      </section>
    </div>
  );
}
