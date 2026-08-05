// app/admin/orders/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { listAdminOrders } from "@/lib/admin/orders-admin";
import { OrderDetailCard } from "@/components/admin/order-detail-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

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
        description="Click an order to view full customer, shipping, payment, and line-item details. Customers are emailed on each status change."
      />
      {orders.length === 0 ? (
        <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          No orders in this session yet. Complete a mock checkout to populate.
        </p>
      ) : (
        <ul className="space-y-4" role="list">
          {orders.map((order) => (
            <OrderDetailCard key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}
