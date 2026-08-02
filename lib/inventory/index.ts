// lib/inventory/index.ts
import "server-only";
import { cache } from "react";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import type { ReserveLine } from "./logic";
import * as inventoryDb from "./inventory-db";

export * from "./logic";

export async function reserveInventoryForOrder(orderId: string, lines: ReserveLine[]) {
  if (!isGrowthDatabaseMode()) return { ok: true as const };
  return inventoryDb.reserveInventoryForOrder(orderId, lines);
}

export async function releaseInventoryForOrder(orderId: string) {
  if (!isGrowthDatabaseMode()) return false;
  return inventoryDb.releaseInventoryForOrder(orderId);
}

export async function commitInventoryForOrder(orderId: string) {
  if (!isGrowthDatabaseMode()) return;
  await inventoryDb.commitInventoryForOrder(orderId);
}

export async function syncInventoryQuantity(variantId: string, quantityOnHand: number) {
  if (!isGrowthDatabaseMode()) return;
  await inventoryDb.setInventoryQuantity(variantId, quantityOnHand);
}

export const loadInventoryOverlay = cache(async (): Promise<Record<string, number>> => {
  if (!isGrowthDatabaseMode()) return {};
  if (process.env.NEXT_PHASE === "phase-production-build") return {};
  try {
    return await inventoryDb.readAllInventoryQuantities();
  } catch (err) {
    console.error("[inventory] overlay read failed", err);
    return {};
  }
});
