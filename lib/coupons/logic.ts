// lib/coupons/logic.ts
import type { AppliedCoupon, Coupon } from "./types";

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export function isCouponCurrentlyValid(coupon: Coupon, now = new Date()): boolean {
  if (!coupon.active) return false;
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return false;
  if (coupon.endsAt && new Date(coupon.endsAt) < now) return false;
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return false;
  return true;
}

export function computeCouponDiscount(
  coupon: Coupon,
  subtotalCents: number
): AppliedCoupon | { error: string } {
  if (!isCouponCurrentlyValid(coupon)) {
    return { error: "This coupon is not active." };
  }
  if (subtotalCents < coupon.minSubtotalCents) {
    return {
      error: `Minimum subtotal is $${(coupon.minSubtotalCents / 100).toFixed(2)}.`,
    };
  }

  let discountCents = 0;
  if (coupon.type === "percentage") {
    discountCents = Math.round((subtotalCents * coupon.value) / 100);
  } else {
    discountCents = coupon.value;
  }
  discountCents = Math.min(discountCents, subtotalCents);

  return {
    code: coupon.code,
    discountCents,
    label:
      coupon.type === "percentage"
        ? `${coupon.value}% off (${coupon.code})`
        : `$${(coupon.value / 100).toFixed(2)} off (${coupon.code})`,
  };
}
