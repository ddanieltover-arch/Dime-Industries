// lib/checkout/repository.ts
/**
 * Order persistence seam.
 *
 * - cookie: HTTP-only jar (local/demo)
 * - database: commerce_orders via Drizzle (ORDERS_PERSISTENCE=database|auto + DATABASE_URL)
 */
import "server-only";
import { isDatabaseUrlConfigured } from "@/lib/db/client";
import type { OrderRepository } from "./types";
import * as cookieOrders from "./orders";
import { drizzleOrderRepository } from "./orders-db";

const cookieRepository: OrderRepository = {
  mode: "cookie",
  async list(options) {
    const all = await cookieOrders.listOrders();
    const filtered = options?.email
      ? all.filter((o) => o.email.toLowerCase() === options.email!.toLowerCase())
      : all;
    return filtered.slice(0, options?.limit ?? 40);
  },
  getById: (id) => cookieOrders.getOrderById(id),
  async getByPaymentRequestId(paymentRequestId) {
    const all = await cookieOrders.listOrders();
    return all.find((o) => o.paymentRequestId === paymentRequestId) ?? null;
  },
  create: (input) => cookieOrders.createOrder(input),
  update: (id, patch) => cookieOrders.updateOrder(id, patch),
  markPaid: (id) => cookieOrders.markOrderPaid(id),
  async markPaidByPaymentRequestId(paymentRequestId) {
    const hit = await cookieRepository.getByPaymentRequestId(paymentRequestId);
    if (!hit) return null;
    if (hit.status === "payment_confirmed") return hit;
    return cookieOrders.markOrderPaid(hit.id);
  },
};

export type OrdersPersistenceMode = "cookie" | "database" | "auto";

export function resolveOrdersPersistence(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): "cookie" | "database" {
  const raw = (env.ORDERS_PERSISTENCE ?? "auto").trim().toLowerCase();
  const mode = (["cookie", "database", "auto"].includes(raw) ? raw : "auto") as OrdersPersistenceMode;
  if (mode === "cookie") return "cookie";
  if (mode === "database") {
    if (!env.DATABASE_URL?.trim()) {
      throw new Error("ORDERS_PERSISTENCE=database requires DATABASE_URL");
    }
    return "database";
  }
  return env.DATABASE_URL?.trim() ? "database" : "cookie";
}

export function isOrdersDatabaseMode(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): boolean {
  try {
    return resolveOrdersPersistence(env) === "database";
  } catch {
    return false;
  }
}

export function getOrderRepository(): OrderRepository {
  const mode = resolveOrdersPersistence();
  if (mode === "database" && isDatabaseUrlConfigured()) {
    return drizzleOrderRepository;
  }
  return cookieRepository;
}

export type { OrderRepository } from "./types";
