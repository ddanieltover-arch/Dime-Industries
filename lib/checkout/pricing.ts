// lib/checkout/pricing.ts
import type { LaunchJurisdiction } from "@/lib/compliance/age-gate";
import type { CartLine } from "@/lib/cart/types";
import type { AppliedCoupon } from "@/lib/coupons/types";

export type CheckoutAddress = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: "US";
};

export type PricingBreakdown = {
  subtotalCents: number;
  discountCents: number;
  discountLabel: string | null;
  couponCode: string | null;
  loyaltyDiscountCents: number;
  loyaltyPointsRedeemed: number;
  taxableCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  taxRateBps: number;
  shippingLabel: string;
  taxLabel: string;
  lines: CartLine[];
};

export const TAX_RATE_BPS: Record<LaunchJurisdiction, number> = {
  CA: 950,
  MA: 1625,
};

export const FREE_SHIPPING_THRESHOLD_CENTS = 10000;
export const FLAT_SHIPPING_CENTS = 800;

export function computeSubtotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity * l.unitPriceCents, 0);
}

export function computeShippingCents(subtotalAfterDiscountCents: number): {
  shippingCents: number;
  shippingLabel: string;
} {
  if (subtotalAfterDiscountCents <= 0) {
    return { shippingCents: 0, shippingLabel: "No shipping" };
  }
  if (subtotalAfterDiscountCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
    return { shippingCents: 0, shippingLabel: "Free shipping (order $100+)" };
  }
  return {
    shippingCents: FLAT_SHIPPING_CENTS,
    shippingLabel: `Flat rate shipping`,
  };
}

export function computeTaxCents(
  taxableCents: number,
  jurisdiction: LaunchJurisdiction
): {
  taxCents: number;
  taxRateBps: number;
  taxLabel: string;
} {
  const taxRateBps = TAX_RATE_BPS[jurisdiction];
  const taxCents = Math.round((taxableCents * taxRateBps) / 10000);
  return {
    taxCents,
    taxRateBps,
    taxLabel: `${jurisdiction} estimated tax (${(taxRateBps / 100).toFixed(2)}%)`,
  };
}

export function computePricing(
  lines: CartLine[],
  jurisdiction: LaunchJurisdiction,
  coupon?: AppliedCoupon | null,
  loyalty?: { points: number; discountCents: number } | null
): PricingBreakdown {
  const subtotalCents = computeSubtotalCents(lines);
  const couponDiscount = Math.min(coupon?.discountCents ?? 0, subtotalCents);
  const afterCoupon = Math.max(0, subtotalCents - couponDiscount);
  const loyaltyDiscountCents = Math.min(loyalty?.discountCents ?? 0, afterCoupon);
  const loyaltyPointsRedeemed = loyaltyDiscountCents > 0 ? loyalty?.points ?? 0 : 0;
  const taxableCents = Math.max(0, afterCoupon - loyaltyDiscountCents);
  const tax = computeTaxCents(taxableCents, jurisdiction);
  const shipping = computeShippingCents(taxableCents);
  const totalCents = taxableCents + tax.taxCents + shipping.shippingCents;
  return {
    subtotalCents,
    discountCents: couponDiscount,
    discountLabel: coupon?.label ?? null,
    couponCode: coupon?.code ?? null,
    loyaltyDiscountCents,
    loyaltyPointsRedeemed,
    taxableCents,
    taxCents: tax.taxCents,
    shippingCents: shipping.shippingCents,
    totalCents,
    taxRateBps: tax.taxRateBps,
    shippingLabel: shipping.shippingLabel,
    taxLabel: tax.taxLabel,
    lines,
  };
}
