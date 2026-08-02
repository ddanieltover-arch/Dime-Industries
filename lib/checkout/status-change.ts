// lib/checkout/status-change.ts
// Single path for order status mutations that also emails the customer.

import "server-only";
import { getOrderRepository, type OrderStatus } from "@/lib/checkout";
import type { CheckoutOrder } from "@/lib/checkout/types";

export async function changeOrderStatus(
  orderId: string,
  status: OrderStatus,
  options?: { notify?: boolean }
): Promise<CheckoutOrder | null> {
  const notify = options?.notify !== false;
  const orders = getOrderRepository();
  const existing = await orders.getById(orderId);
  if (!existing) return null;
  if (existing.status === status) return existing;

  const paidAt =
    status === "payment_confirmed"
      ? existing.paidAt ?? new Date().toISOString()
      : existing.paidAt;

  const updated = await orders.update(orderId, { status, paidAt });
  if (!updated) return null;

  if (notify) {
    try {
      const { notifyOrderStatusChanged } = await import("@/lib/email/notifications");
      await notifyOrderStatusChanged(updated, status, existing.status);
    } catch (err) {
      console.warn("[orders] status notification failed", err);
    }
  }

  return updated;
}
