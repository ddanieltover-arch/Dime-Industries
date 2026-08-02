// lib/checkout/orders.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { isActiveLaunchJurisdiction } from "@/lib/admin/site-settings-store";
import type { CheckoutOrder, CreateOrderInput, OrderStatus } from "./types";
import { ORDERS_COOKIE, ORDERS_COOKIE_MAX } from "./types";

const orderSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "payment_confirmed", "cancelled", "rejected"]),
  email: z.string().email(),
  address: z.object({
    fullName: z.string(),
    email: z.string().email(),
    phone: z.string().optional().default(""),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string().min(2).max(40),
    postalCode: z.string(),
    country: z.literal("US").optional().default("US"),
  }),
  jurisdiction: z.enum(["CA", "MA"]),
  lines: z.array(z.any()),
  subtotalCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative().default(0),
  discountLabel: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  couponCode: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  taxCents: z.number().int().nonnegative(),
  shippingCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  taxLabel: z.string(),
  shippingLabel: z.string(),
  paymentMethod: z
    .enum(["paybis_btc", "net_terms", "cashapp", "apple_pay", "chime", "zelle"])
    .default("paybis_btc"),
  paymentRequestId: z.string().nullable(),
  paymentMode: z.enum(["live", "mock"]).nullable(),
  createdAt: z.string(),
  paidAt: z.string().nullable(),
  channel: z.enum(["retail", "wholesale"]).optional(),
  paymentTerms: z.enum(["net30", "net60", "upfront"]).nullable().optional(),
  wholesaleBusinessName: z.string().nullable().optional(),
  loyaltyPointsRedeemed: z.number().int().nonnegative().optional(),
  loyaltyDiscountCents: z.number().int().nonnegative().optional(),
  carrier: z.string().nullable().optional(),
  trackingNumber: z.string().nullable().optional(),
  trackingUrl: z.string().nullable().optional(),
  shippedAt: z.string().nullable().optional(),
});

const jarSchema = z.object({
  orders: z.array(orderSchema).max(ORDERS_COOKIE_MAX),
});

async function readJar(): Promise<CheckoutOrder[]> {
  const store = await cookies();
  const raw = store.get(ORDERS_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? (parsed.data.orders as CheckoutOrder[]) : [];
  } catch {
    return [];
  }
}

async function writeJar(orders: CheckoutOrder[]): Promise<void> {
  const store = await cookies();
  const trimmed = orders.slice(0, ORDERS_COOKIE_MAX);
  store.set(ORDERS_COOKIE, encodeURIComponent(JSON.stringify({ orders: trimmed })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function newOrderId() {
  return `ord_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export async function listOrders(): Promise<CheckoutOrder[]> {
  return readJar();
}

export async function getOrderById(orderId: string): Promise<CheckoutOrder | null> {
  const orders = await readJar();
  return orders.find((o) => o.id === orderId) ?? null;
}

export async function createOrder(input: CreateOrderInput): Promise<CheckoutOrder> {
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
    email: input.email,
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

  const existing = await readJar();
  await writeJar([order, ...existing.filter((o) => o.id !== order.id)]);
  return order;
}

export async function updateOrder(
  orderId: string,
  patch: Partial<
    Pick<CheckoutOrder, "status" | "paymentRequestId" | "paymentMode" | "paidAt">
  >
): Promise<CheckoutOrder | null> {
  const orders = await readJar();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const next = { ...orders[idx]!, ...patch };
  orders[idx] = next;
  await writeJar(orders);
  return next;
}

export async function markOrderPaid(orderId: string): Promise<CheckoutOrder | null> {
  return updateOrder(orderId, {
    status: "payment_confirmed" satisfies OrderStatus,
    paidAt: new Date().toISOString(),
  });
}
