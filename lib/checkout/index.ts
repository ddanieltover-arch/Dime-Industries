// lib/checkout/index.ts
export * from "./pricing";
export * from "./types";
export * from "./validate";
export * from "./countries";
export * from "./tax-rates";
export * from "./subdivisions";
export { newOrderId } from "./orders";
export {
  getOrderRepository,
  isOrdersDatabaseMode,
  resolveOrdersPersistence,
} from "./repository";

import { getOrderRepository } from "./repository";
import type { CheckoutOrder, CreateOrderInput, OrderListOptions } from "./types";

/** Compatibility wrappers — prefer getOrderRepository() in new code. */
export async function listOrders(options?: OrderListOptions) {
  return getOrderRepository().list(options);
}

export async function getOrderById(orderId: string) {
  return getOrderRepository().getById(orderId);
}

export async function createOrder(input: CreateOrderInput) {
  return getOrderRepository().create(input);
}

export async function updateOrder(
  orderId: string,
  patch: Partial<
    Pick<CheckoutOrder, "status" | "paymentRequestId" | "paymentMode" | "paidAt">
  >
) {
  return getOrderRepository().update(orderId, patch);
}

export async function markOrderPaid(orderId: string) {
  return getOrderRepository().markPaid(orderId);
}
