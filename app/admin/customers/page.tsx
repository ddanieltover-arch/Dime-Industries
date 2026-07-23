// app/admin/customers/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { listAdminOrders } from "@/lib/admin/orders-admin";

export const metadata: Metadata = {
  title: "Admin customers",
  robots: { index: false, follow: false },
};

export default async function AdminCustomersPage() {
  await requireAdmin();
  const orders = await listAdminOrders();
  const byEmail = new Map<string, { orders: number; spent: number }>();
  for (const order of orders) {
    const row = byEmail.get(order.email) ?? { orders: 0, spent: 0 };
    row.orders += 1;
    if (order.status === "payment_confirmed") row.spent += order.totalCents;
    byEmail.set(order.email, row);
  }
  const customers = [...byEmail.entries()].sort((a, b) => b[1].spent - a[1].spent);

  return (
    <div>
      <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
        Customers
      </h2>
      <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Derived from session orders for now. Full CRM arrives with Supabase user tables in staging.
      </p>
      {customers.length === 0 ? (
        <p className="mt-8 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">No customer signals yet.</p>
      ) : (
        <ul className="mt-8 space-y-3" role="list">
          {customers.map(([email, stats]) => (
            <li
              key={email}
              className="flex flex-wrap justify-between gap-2 border border-[var(--color-border)] px-4 py-3 text-[var(--scale-sm)]"
            >
              <span className="text-[var(--color-ink)]">{email}</span>
              <span className="font-[var(--font-mono)] text-[var(--color-ink-soft)]">
                {stats.orders} orders · ${(stats.spent / 100).toFixed(2)} paid
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
