// lib/checkout/orders-db.ts
import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { commerceOrders } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { isActiveLaunchJurisdiction } from "@/lib/admin/site-settings-store";
import { newOrderId } from "./orders";
import type { CheckoutOrder, CreateOrderInput, OrderRepository, OrderStatus } from "./types";

function rowToOrder(row: typeof commerceOrders.$inferSelect): CheckoutOrder {
  const payload = row.payload as CheckoutOrder;
  return {
    ...payload,
    id: row.id,
    status: row.status as OrderStatus,
    email: row.email,
    jurisdiction: row.jurisdiction as CheckoutOrder["jurisdiction"],
    paymentRequestId: row.paymentRequestId,
    paymentMode: (row.paymentMode as CheckoutOrder["paymentMode"]) ?? null,
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

async function getById(orderId: string): Promise<CheckoutOrder | null> {
  const db = getDb();
  const rows = await db.select().from(commerceOrders).where(eq(commerceOrders.id, orderId)).limit(1);
  return rows[0] ? rowToOrder(rows[0]) : null;
}

async function getByPaymentRequestId(paymentRequestId: string): Promise<CheckoutOrder | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceOrders)
    .where(eq(commerceOrders.paymentRequestId, paymentRequestId))
    .limit(1);
  return rows[0] ? rowToOrder(rows[0]) : null;
}

async function list(options?: { email?: string; limit?: number }): Promise<CheckoutOrder[]> {
  const db = getDb();
  const limit = options?.limit ?? 40;
  const rows = options?.email
    ? await db
        .select()
        .from(commerceOrders)
        .where(eq(commerceOrders.email, options.email.toLowerCase()))
        .orderBy(desc(commerceOrders.createdAt))
        .limit(limit)
    : await db.select().from(commerceOrders).orderBy(desc(commerceOrders.createdAt)).limit(limit);
  return rows.map(rowToOrder);
}

async function create(input: CreateOrderInput): Promise<CheckoutOrder> {
  if (!(await isActiveLaunchJurisdiction(input.jurisdiction))) {
    throw new Error("Unsupported jurisdiction");
  }
  if (input.lines.length === 0) {
    throw new Error("Cart is empty");
  }

  const acceptOnTerms = Boolean(input.acceptOnTerms);
  const order: CheckoutOrder = {
    id: newOrderId(),
    status: acceptOnTerms ? "payment_confirmed" : "pending",
    email: input.email.toLowerCase(),
    address: input.address,
    jurisdiction: input.jurisdiction,
    lines: input.lines,
    subtotalCents: input.pricing.subtotalCents,
    discountCents: input.pricing.discountCents,
    discountLabel: input.pricing.discountLabel,
    couponCode: input.pricing.couponCode,
    taxCents: input.pricing.taxCents,
    shippingCents: input.pricing.shippingCents,
    totalCents: input.pricing.totalCents,
    taxLabel: input.pricing.taxLabel,
    shippingLabel: input.pricing.shippingLabel,
    paymentMethod: input.paymentMethod ?? "paybis_btc",
    paymentRequestId: null,
    paymentMode: null,
    createdAt: new Date().toISOString(),
    paidAt: acceptOnTerms ? new Date().toISOString() : null,
    channel: input.channel ?? "retail",
    paymentTerms: input.paymentTerms ?? null,
    wholesaleBusinessName: input.wholesaleBusinessName ?? null,
    loyaltyPointsRedeemed: input.pricing.loyaltyPointsRedeemed ?? 0,
    loyaltyDiscountCents: input.pricing.loyaltyDiscountCents ?? 0,
  };

  const db = getDb();
  await db.insert(commerceOrders).values({
    id: order.id,
    status: order.status,
    email: order.email,
    jurisdiction: order.jurisdiction,
    payload: order,
    paymentRequestId: null,
    paymentMode: null,
    paidAt: null,
  });

  return order;
}

async function update(
  orderId: string,
  patch: Partial<
    Pick<CheckoutOrder, "status" | "paymentRequestId" | "paymentMode" | "paidAt">
  >
): Promise<CheckoutOrder | null> {
  const current = await getById(orderId);
  if (!current) return null;
  const next: CheckoutOrder = { ...current, ...patch };
  const db = getDb();
  await db
    .update(commerceOrders)
    .set({
      status: next.status,
      payload: next,
      paymentRequestId: next.paymentRequestId,
      paymentMode: next.paymentMode,
      paidAt: next.paidAt ? new Date(next.paidAt) : null,
      updatedAt: new Date(),
    })
    .where(eq(commerceOrders.id, orderId));
  return next;
}

async function markPaid(orderId: string): Promise<CheckoutOrder | null> {
  return update(orderId, {
    status: "payment_confirmed",
    paidAt: new Date().toISOString(),
  });
}

async function markPaidByPaymentRequestId(
  paymentRequestId: string
): Promise<CheckoutOrder | null> {
  const existing = await getByPaymentRequestId(paymentRequestId);
  if (!existing) return null;
  if (existing.status === "payment_confirmed") return existing;
  return markPaid(existing.id);
}

export const drizzleOrderRepository: OrderRepository = {
  mode: "database",
  list,
  getById,
  getByPaymentRequestId,
  create,
  update,
  markPaid,
  markPaidByPaymentRequestId,
};

/** Health probe — confirms commerce_orders is reachable. */
export async function pingCommerceOrders(): Promise<boolean> {
  try {
    const db = getDb();
    await db.execute(sql`select 1 from commerce_orders limit 1`);
    return true;
  } catch {
    return false;
  }
}
