// lib/inventory/index.ts
import "server-only";
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

export async function loadInventoryOverlay(): Promise<Record<string, number>> {
  if (!isGrowthDatabaseMode()) return {};
  return inventoryDb.readAllInventoryQuantities();
}
