// lib/coupons/store.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { computeCouponDiscount, normalizeCouponCode } from "./logic";
import type { AppliedCoupon, Coupon } from "./types";

export const COUPONS_COOKIE = "dime_coupons";
export const APPLIED_COUPON_COOKIE = "dime_applied_coupon";

const couponSchema = z.object({
  id: z.string(),
  code: z.string(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().int().nonnegative(),
  minSubtotalCents: z.number().int().nonnegative(),
  active: z.boolean(),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  usageLimit: z.number().int().nullable(),
  usedCount: z.number().int().nonnegative(),
});

const jarSchema = z.object({ coupons: z.array(couponSchema).max(50) });

const SEED: Coupon[] = [
  {
    id: "cpn_welcome10",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minSubtotalCents: 2500,
    active: true,
    startsAt: null,
    endsAt: null,
    usageLimit: null,
    usedCount: 0,
  },
  {
    id: "cpn_flat5",
    code: "SAVE5",
    type: "fixed",
    value: 500,
    minSubtotalCents: 0,
    active: true,
    startsAt: null,
    endsAt: null,
    usageLimit: 100,
    usedCount: 0,
  },
];

async function readCoupons(): Promise<Coupon[]> {
  const { isGrowthDatabaseMode } = await import("@/lib/db/growth-mode");
  if (isGrowthDatabaseMode()) {
    const { dbSeedCouponsIfEmpty, dbListCoupons } = await import("./coupons-db");
    await dbSeedCouponsIfEmpty(SEED);
    return dbListCoupons();
  }

  const store = await cookies();
  const raw = store.get(COUPONS_COOKIE)?.value;
  if (!raw) return [...SEED];
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success && parsed.data.coupons.length ? parsed.data.coupons : [...SEED];
  } catch {
    return [...SEED];
  }
}

async function writeCoupons(coupons: Coupon[]): Promise<void> {
  const { isGrowthDatabaseMode } = await import("@/lib/db/growth-mode");
  if (isGrowthDatabaseMode()) {
    const { dbUpsertCoupon } = await import("./coupons-db");
    for (const coupon of coupons) await dbUpsertCoupon(coupon);
    return;
  }

  const store = await cookies();
  store.set(COUPONS_COOKIE, encodeURIComponent(JSON.stringify({ coupons })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function listCoupons(): Promise<Coupon[]> {
  return readCoupons();
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const normalized = normalizeCouponCode(code);
  const coupons = await readCoupons();
  return coupons.find((c) => c.code === normalized) ?? null;
}

export async function upsertCoupon(coupon: Coupon): Promise<void> {
  const { isGrowthDatabaseMode } = await import("@/lib/db/growth-mode");
  if (isGrowthDatabaseMode()) {
    const { dbUpsertCoupon } = await import("./coupons-db");
    await dbUpsertCoupon({ ...coupon, code: normalizeCouponCode(coupon.code) });
    return;
  }
  const coupons = await readCoupons();
  const idx = coupons.findIndex((c) => c.id === coupon.id || c.code === coupon.code);
  if (idx >= 0) coupons[idx] = { ...coupon, code: normalizeCouponCode(coupon.code) };
  else coupons.push({ ...coupon, code: normalizeCouponCode(coupon.code) });
  await writeCoupons(coupons);
}

export async function getAppliedCouponCode(): Promise<string | null> {
  const store = await cookies();
  return store.get(APPLIED_COUPON_COOKIE)?.value ?? null;
}

export async function setAppliedCouponCode(code: string | null): Promise<void> {
  const store = await cookies();
  if (!code) {
    store.set(APPLIED_COUPON_COOKIE, "", { path: "/", maxAge: 0 });
    return;
  }
  store.set(APPLIED_COUPON_COOKIE, normalizeCouponCode(code), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function resolveAppliedCoupon(
  subtotalCents: number
): Promise<AppliedCoupon | null> {
  const code = await getAppliedCouponCode();
  if (!code) return null;
  const coupon = await getCouponByCode(code);
  if (!coupon) {
    await setAppliedCouponCode(null);
    return null;
  }
  const result = computeCouponDiscount(coupon, subtotalCents);
  if ("error" in result) {
    await setAppliedCouponCode(null);
    return null;
  }
  return result;
}

export async function applyCouponCode(
  code: string,
  subtotalCents: number
): Promise<AppliedCoupon | { error: string }> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return { error: "Coupon not found." };
  const result = computeCouponDiscount(coupon, subtotalCents);
  if ("error" in result) return result;
  await setAppliedCouponCode(result.code);
  return result;
}
