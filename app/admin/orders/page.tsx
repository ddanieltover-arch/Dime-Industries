// app/admin/orders/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { listAdminOrders } from "@/lib/admin/orders-admin";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Admin orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await listAdminOrders();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Commerce"
        title="Orders"
        description="Review checkout orders and update status. Customers are emailed on each status change."
      />
      {orders.length === 0 ? (
        <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          No orders in this session yet. Complete a mock checkout to populate.
        </p>
      ) : (
        <ul className="space-y-4" role="list">
          {orders.map((order) => (
            <li key={order.id} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-[var(--font-mono)] text-[var(--color-ink)]">{order.id}</p>
                  <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                    {order.email} · {order.jurisdiction} · {formatPrice(order.totalCents)}
                  </p>
                  <p className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                    {new Date(order.createdAt).toLocaleString()} · {order.lines.length} line(s)
                  </p>
                </div>
                <OrderStatusForm orderId={order.id} status={order.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
