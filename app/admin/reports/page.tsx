// app/admin/reports/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminCatalog } from "@/lib/admin/catalog-overrides";
import { listAdminOrders } from "@/lib/admin/orders-admin";
import {
  buildCategoryBreakdown,
  buildLowStockRows,
  buildPaidOrderRows,
  toCsv,
} from "@/lib/admin/analytics";
import { ReportCsvButton } from "@/components/admin/ops-admin-forms";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Admin reports",
  robots: { index: false, follow: false },
};

export default async function AdminReportsPage() {
  await requireAdmin();
  const [catalog, orders] = await Promise.all([getAdminCatalog(), listAdminOrders()]);
  const paid = buildPaidOrderRows(orders);
  const lowStock = buildLowStockRows(catalog);
  const categories = buildCategoryBreakdown(catalog);

  const paidCsv = toCsv(
    ["order_id", "email", "total_cents", "status", "created_at", "paid_at"],
    paid.map((r) => [r.id, r.email, r.totalCents, r.status, r.createdAt, r.paidAt])
  );
  const stockCsv = toCsv(
    ["product", "slug", "sku", "format", "qty"],
    lowStock.map((r) => [r.productName, r.productSlug, r.sku, r.format, r.quantityOnHand])
  );
  const catCsv = toCsv(
    ["slug", "name", "products", "active"],
    categories.map((c) => [c.slug, c.name, c.products, c.active])
  );

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Reports
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          CSV exports from orders and catalog. Sales KPIs live on the{" "}
          <Link href="/admin" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
            Dashboard
          </Link>
          .
        </p>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
            Paid orders
          </h3>
          <ReportCsvButton filename="dime-paid-orders.csv" csv={paidCsv} label="Download CSV" />
        </div>
        {paid.length === 0 ? (
          <p className="mt-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">No paid orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-[var(--color-border)]">
            <table className="w-full min-w-[40rem] text-left text-[var(--scale-sm)]">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface)] font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                <tr>
                  <th className="px-3 py-2 font-normal">Order</th>
                  <th className="px-3 py-2 font-normal">Email</th>
                  <th className="px-3 py-2 font-normal">Total</th>
                  <th className="px-3 py-2 font-normal">Paid</th>
                </tr>
              </thead>
              <tbody>
                {paid.slice(0, 25).map((row) => (
                  <tr key={row.id} className="border-b border-[var(--color-border)]">
                    <td className="px-3 py-2 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink)]">
                      {row.id.slice(0, 8)}…
                    </td>
                    <td className="px-3 py-2 text-[var(--color-ink-soft)]">{row.email}</td>
                    <td className="px-3 py-2 text-[var(--color-ink)]">{formatPrice(row.totalCents)}</td>
                    <td className="px-3 py-2 text-[var(--color-ink-soft)]">
                      {(row.paidAt ?? row.createdAt).slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
            Low stock
          </h3>
          <ReportCsvButton filename="dime-low-stock.csv" csv={stockCsv} label="Download CSV" />
        </div>
        {lowStock.length === 0 ? (
          <p className="mt-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">No low-stock variants.</p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-[var(--color-border)]">
            <table className="w-full min-w-[36rem] text-left text-[var(--scale-sm)]">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface)] font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                <tr>
                  <th className="px-3 py-2 font-normal">Product</th>
                  <th className="px-3 py-2 font-normal">SKU</th>
                  <th className="px-3 py-2 font-normal">Qty</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.slice(0, 40).map((row) => (
                  <tr key={`${row.productSlug}-${row.sku}`} className="border-b border-[var(--color-border)]">
                    <td className="px-3 py-2 text-[var(--color-ink)]">
                      {row.productName}{" "}
                      <span className="text-[var(--color-ink-soft)]">· {row.format}</span>
                    </td>
                    <td className="px-3 py-2 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                      {row.sku}
                    </td>
                    <td className="px-3 py-2 text-[var(--color-flag)]">{row.quantityOnHand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
            Category counts
          </h3>
          <ReportCsvButton filename="dime-categories.csv" csv={catCsv} label="Download CSV" />
        </div>
        <ul className="mt-4 divide-y divide-[var(--color-border)] border border-[var(--color-border)]" role="list">
          {categories.map((cat) => (
            <li key={cat.slug} className="flex justify-between gap-3 px-4 py-3 text-[var(--scale-sm)]">
              <span className="text-[var(--color-ink)]">{cat.name}</span>
              <span className="text-[var(--color-ink-soft)]">
                {cat.active} / {cat.products}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
