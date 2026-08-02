// lib/admin/orders-admin.ts
import "server-only";
import { getOrderRepository, type OrderStatus } from "@/lib/checkout";
import { changeOrderStatus } from "@/lib/checkout/status-change";
import type { CheckoutOrder } from "@/lib/checkout/types";

const ADMIN_STATUSES: OrderStatus[] = [
  "pending",
  "payment_confirmed",
  "cancelled",
  "rejected",
];

export function isAdminOrderStatus(v: string): v is OrderStatus {
  return (ADMIN_STATUSES as string[]).includes(v);
}

export async function listAdminOrders(): Promise<CheckoutOrder[]> {
  return getOrderRepository().list({ limit: 50 });
}

export async function setAdminOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<CheckoutOrder | null> {
  return changeOrderStatus(orderId, status, { notify: true });
}

export function adminOrderKpis(orders: CheckoutOrder[]) {
  const paid = orders.filter((o) => o.status === "payment_confirmed");
  const revenueCents = paid.reduce((sum, o) => sum + o.totalCents, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  return {
    orderCount: orders.length,
    paidCount: paid.length,
    pendingCount: pending,
    revenueCents,
    aovCents: paid.length ? Math.round(revenueCents / paid.length) : 0,
  };
}
