// lib/inventory/inventory-db.ts
import "server-only";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { commerceInventory, commerceInventoryReservations } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { SEED_CATALOG } from "@/lib/catalog/seed-catalog";
import { collapseReserveLines, type ReserveLine } from "./logic";

const reservationItemsSchema = z.array(
  z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().positive(),
  })
);

function seedQty(variantId: string): number {
  for (const product of SEED_CATALOG) {
    const v = product.variants.find((x) => x.id === variantId);
    if (v) return v.quantityOnHand;
  }
  return 0;
}

export async function ensureInventoryRow(variantId: string, fallbackQty?: number): Promise<number> {
  const db = getDb();
  const existing = await db
    .select()
    .from(commerceInventory)
    .where(eq(commerceInventory.variantId, variantId))
    .limit(1);
  if (existing[0]) return existing[0].quantityOnHand;

  const qty = fallbackQty ?? seedQty(variantId);
  await db
    .insert(commerceInventory)
    .values({
      variantId,
      quantityOnHand: Math.max(0, qty),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  const again = await db
    .select()
    .from(commerceInventory)
    .where(eq(commerceInventory.variantId, variantId))
    .limit(1);
  return again[0]?.quantityOnHand ?? Math.max(0, qty);
}

export async function readAllInventoryQuantities(): Promise<Record<string, number>> {
  const db = getDb();
  const rows = await db.select().from(commerceInventory);
  const out: Record<string, number> = {};
  for (const row of rows) out[row.variantId] = row.quantityOnHand;
  return out;
}

export async function setInventoryQuantity(variantId: string, quantityOnHand: number): Promise<void> {
  const db = getDb();
  const qty = Math.max(0, Math.floor(quantityOnHand));
  await db
    .insert(commerceInventory)
    .values({ variantId, quantityOnHand: qty, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: commerceInventory.variantId,
      set: { quantityOnHand: qty, updatedAt: new Date() },
    });
}

export type ReserveResult =
  | { ok: true }
  | { ok: false; error: string; variantId?: string };

/**
 * Atomically decrement stock for an order. Idempotent if reservation already exists.
 */
export async function reserveInventoryForOrder(
  orderId: string,
  lines: ReserveLine[]
): Promise<ReserveResult> {
  const db = getDb();
  const collapsed = collapseReserveLines(lines);
  if (collapsed.length === 0) return { ok: true };

  const existing = await db
    .select()
    .from(commerceInventoryReservations)
    .where(eq(commerceInventoryReservations.orderId, orderId))
    .limit(1);

  if (existing[0]) {
    if (existing[0].status === "reserved" || existing[0].status === "committed") {
      return { ok: true };
    }
    // previously released — allow re-reserve by deleting row
    await db
      .delete(commerceInventoryReservations)
      .where(eq(commerceInventoryReservations.orderId, orderId));
  }

  const reserved: ReserveLine[] = [];
  for (const line of collapsed) {
    await ensureInventoryRow(line.variantId);
    const updated = await db
      .update(commerceInventory)
      .set({
        quantityOnHand: sql`${commerceInventory.quantityOnHand} - ${line.quantity}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(commerceInventory.variantId, line.variantId),
          gte(commerceInventory.quantityOnHand, line.quantity)
        )
      )
      .returning({ variantId: commerceInventory.variantId });

    if (updated.length === 0) {
      // roll back partial
      for (const done of reserved) {
        await db
          .update(commerceInventory)
          .set({
            quantityOnHand: sql`${commerceInventory.quantityOnHand} + ${done.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(commerceInventory.variantId, done.variantId));
      }
      return {
        ok: false,
        error: "Insufficient stock for one or more items.",
        variantId: line.variantId,
      };
    }
    reserved.push(line);
  }

  await db.insert(commerceInventoryReservations).values({
    orderId,
    items: collapsed,
    status: "reserved",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { ok: true };
}

export async function releaseInventoryForOrder(orderId: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceInventoryReservations)
    .where(eq(commerceInventoryReservations.orderId, orderId))
    .limit(1);
  const row = rows[0];
  if (!row || row.status !== "reserved") return false;

  const items = reservationItemsSchema.safeParse(row.items);
  if (items.success) {
    for (const line of items.data) {
      await db
        .update(commerceInventory)
        .set({
          quantityOnHand: sql`${commerceInventory.quantityOnHand} + ${line.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(commerceInventory.variantId, line.variantId));
    }
  }

  await db
    .update(commerceInventoryReservations)
    .set({ status: "released", updatedAt: new Date() })
    .where(eq(commerceInventoryReservations.orderId, orderId));
  return true;
}

export async function commitInventoryForOrder(orderId: string): Promise<void> {
  const db = getDb();
  await db
    .update(commerceInventoryReservations)
    .set({ status: "committed", updatedAt: new Date() })
    .where(
      and(
        eq(commerceInventoryReservations.orderId, orderId),
        eq(commerceInventoryReservations.status, "reserved")
      )
    );
}
