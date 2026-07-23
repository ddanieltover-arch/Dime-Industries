// lib/coupons/types.ts
export type CouponType = "percentage" | "fixed";

export type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  /** percentage points (10 = 10%) or cents for fixed */
  value: number;
  minSubtotalCents: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
};

export type AppliedCoupon = {
  code: string;
  discountCents: number;
  label: string;
};
