// lib/checkout/pricing.ts
import type { CartLine } from "@/lib/cart/types";
import type { AppliedCoupon } from "@/lib/coupons/types";
import { shippingCountryName } from "@/lib/checkout/countries";
import { normalizeUsStateCode, resolveTaxRateBps } from "@/lib/checkout/tax-rates";

export type CheckoutAddress = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type ShippingDestination = {
  state: string;
  country?: string;
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

/** @deprecated Prefer resolveTaxRateBps — kept for callers that still key CA/MA. */
export const TAX_RATE_BPS = {
  CA: 950,
  MA: 1625,
} as const;

export const FREE_SHIPPING_THRESHOLD_CENTS = 30000;
/** Flat-rate shipping within the United States (under free-shipping threshold). */
export const FLAT_SHIPPING_CENTS = 1200;
/** Flat-rate shipping outside the United States (under free-shipping threshold). */
export const FLAT_SHIPPING_INTL_CENTS = 2500;

function normalizeDestination(
  destination: ShippingDestination | string
): Required<ShippingDestination> {
  if (typeof destination === "string") {
    return { state: destination, country: "US" };
  }
  return {
    state: destination.state,
    country: (destination.country ?? "US").toUpperCase(),
  };
}

export function computeSubtotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity * l.unitPriceCents, 0);
}

export function computeShippingCents(
  subtotalAfterDiscountCents: number,
  country = "US"
): {
  shippingCents: number;
  shippingLabel: string;
} {
  if (subtotalAfterDiscountCents <= 0) {
    return { shippingCents: 0, shippingLabel: "No shipping" };
  }
  if (subtotalAfterDiscountCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
    return { shippingCents: 0, shippingLabel: "Free shipping (order $300+)" };
  }
  const isUs = country.toUpperCase() === "US";
  return {
    shippingCents: isUs ? FLAT_SHIPPING_CENTS : FLAT_SHIPPING_INTL_CENTS,
    shippingLabel: isUs ? "Flat rate shipping (US)" : "International shipping",
  };
}

export function computeTaxCents(
  taxableCents: number,
  destination: ShippingDestination | string
): {
  taxCents: number;
  taxRateBps: number;
  taxLabel: string;
} {
  const { state, country } = normalizeDestination(destination);
  const taxRateBps = resolveTaxRateBps(state, country);
  const taxCents = Math.round((taxableCents * taxRateBps) / 10000);

  if (country !== "US") {
    const countryName = shippingCountryName(country);
    if (taxRateBps === 0) {
      return {
        taxCents: 0,
        taxRateBps: 0,
        taxLabel: `${countryName} estimated tax (0.00%)`,
      };
    }
    return {
      taxCents,
      taxRateBps,
      taxLabel: `${countryName} estimated tax (${(taxRateBps / 100).toFixed(2)}%)`,
    };
  }

  const stateCode = normalizeUsStateCode(state);
  if (!stateCode || taxRateBps === 0) {
    return {
      taxCents: 0,
      taxRateBps: 0,
      taxLabel: stateCode
        ? `${stateCode} estimated tax (0.00%)`
        : "Select a state for estimated tax",
    };
  }

  return {
    taxCents,
    taxRateBps,
    taxLabel: `${stateCode} estimated tax (${(taxRateBps / 100).toFixed(2)}%)`,
  };
}

export function computePricing(
  lines: CartLine[],
  destination: ShippingDestination | string,
  coupon?: AppliedCoupon | null,
  loyalty?: { points: number; discountCents: number } | null
): PricingBreakdown {
  const dest = normalizeDestination(destination);
  const subtotalCents = computeSubtotalCents(lines);
  const couponDiscount = Math.min(coupon?.discountCents ?? 0, subtotalCents);
  const afterCoupon = Math.max(0, subtotalCents - couponDiscount);
  const loyaltyDiscountCents = Math.min(loyalty?.discountCents ?? 0, afterCoupon);
  const loyaltyPointsRedeemed = loyaltyDiscountCents > 0 ? loyalty?.points ?? 0 : 0;
  const taxableCents = Math.max(0, afterCoupon - loyaltyDiscountCents);
  const tax = computeTaxCents(taxableCents, dest);
  const shipping = computeShippingCents(taxableCents, dest.country);
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
