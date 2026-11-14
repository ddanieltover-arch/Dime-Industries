// lib/cart/cart-db.ts
import "server-only";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { commerceCarts } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { withTimeout } from "@/lib/async/with-timeout";
import type { CartLineInput } from "./types";

const CART_DB_TIMEOUT_MS = 2_000;

const itemsSchema = z.array(
  z.object({
    variantId: z.string().min(1).max(80),
    quantity: z.number().int().min(1).max(20),
  })
).max(30);

export function cartOwnerKey(email: string) {
  return email.trim().toLowerCase();
}

async function readDbCartInputsUnbudgeted(ownerKey: string): Promise<CartLineInput[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceCarts)
    .where(eq(commerceCarts.ownerKey, ownerKey))
    .limit(1);
  const raw = rows[0]?.items;
  const parsed = itemsSchema.safeParse(raw ?? []);
  return parsed.success ? parsed.data : [];
}

/** Throws on timeout so callers can fall back to the cookie mirror. */
export async function readDbCartInputs(ownerKey: string): Promise<CartLineInput[]> {
  return withTimeout(
    readDbCartInputsUnbudgeted(ownerKey),
    CART_DB_TIMEOUT_MS,
    "cart-db-read"
  );
}

export async function writeDbCartInputs(
  ownerKey: string,
  items: CartLineInput[]
): Promise<void> {
  const db = getDb();
  await db
    .insert(commerceCarts)
    .values({
      ownerKey,
      items,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: commerceCarts.ownerKey,
      set: { items, updatedAt: new Date() },
    });
}
