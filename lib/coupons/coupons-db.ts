// lib/coupons/coupons-db.ts
import "server-only";
import { eq } from "drizzle-orm";
import { commerceCoupons } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { normalizeCouponCode } from "./logic";
import type { Coupon } from "./types";

function rowToCoupon(row: typeof commerceCoupons.$inferSelect): Coupon {
  return {
    id: row.id,
    code: row.code,
    type: row.type as Coupon["type"],
    value: row.value,
    minSubtotalCents: row.minSubtotalCents,
    active: row.active,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    usageLimit: row.usageLimit,
    usedCount: row.usedCount,
  };
}

export async function dbListCoupons(): Promise<Coupon[]> {
  const db = getDb();
  const rows = await db.select().from(commerceCoupons);
  return rows.map(rowToCoupon);
}

export async function dbGetCouponByCode(code: string): Promise<Coupon | null> {
  const normalized = normalizeCouponCode(code);
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceCoupons)
    .where(eq(commerceCoupons.code, normalized))
    .limit(1);
  return rows[0] ? rowToCoupon(rows[0]) : null;
}

export async function dbUpsertCoupon(coupon: Coupon): Promise<void> {
  const db = getDb();
  const code = normalizeCouponCode(coupon.code);
  await db
    .insert(commerceCoupons)
    .values({
      id: coupon.id,
      code,
      type: coupon.type,
      value: coupon.value,
      minSubtotalCents: coupon.minSubtotalCents,
      active: coupon.active,
      startsAt: coupon.startsAt ? new Date(coupon.startsAt) : null,
      endsAt: coupon.endsAt ? new Date(coupon.endsAt) : null,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
    })
    .onConflictDoUpdate({
      target: commerceCoupons.id,
      set: {
        code,
        type: coupon.type,
        value: coupon.value,
        minSubtotalCents: coupon.minSubtotalCents,
        active: coupon.active,
        startsAt: coupon.startsAt ? new Date(coupon.startsAt) : null,
        endsAt: coupon.endsAt ? new Date(coupon.endsAt) : null,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
      },
    });
}

export async function dbSeedCouponsIfEmpty(seed: Coupon[]): Promise<void> {
  const existing = await dbListCoupons();
  if (existing.length > 0) return;
  for (const coupon of seed) await dbUpsertCoupon(coupon);
}
