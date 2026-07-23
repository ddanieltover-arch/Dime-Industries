// tests/unit/coupons.test.ts
import { describe, it, expect } from "vitest";
import { computeCouponDiscount, normalizeCouponCode } from "../../lib/coupons/logic";
import type { Coupon } from "../../lib/coupons/types";
import { computePricing } from "../../lib/checkout/pricing";
import type { CartLine } from "../../lib/cart/types";

const coupon = (partial: Partial<Coupon> & Pick<Coupon, "code" | "type" | "value">): Coupon => ({
  id: "cpn_test",
  minSubtotalCents: 0,
  active: true,
  startsAt: null,
  endsAt: null,
  usageLimit: null,
  usedCount: 0,
  ...partial,
});

const line = (price: number): CartLine => ({
  variantId: "v1",
  quantity: 1,
  productSlug: "x",
  productName: "X",
  lineName: "Signature",
  weightOrFormat: "1g",
  sku: "X-1G",
  unitPriceCents: price,
  thcPct: 80,
  cbdPct: 0.2,
  maxQuantity: 10,
});

describe("coupon logic", () => {
  it("normalizes codes", () => {
    expect(normalizeCouponCode("  welcome10 ")).toBe("WELCOME10");
  });

  it("applies percentage discount", () => {
    const result = computeCouponDiscount(coupon({ code: "PCT10", type: "percentage", value: 10 }), 5000);
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.discountCents).toBe(500);
  });

  it("applies fixed discount capped at subtotal", () => {
    const result = computeCouponDiscount(coupon({ code: "FLAT", type: "fixed", value: 900 }), 500);
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.discountCents).toBe(500);
  });

  it("enforces minimum subtotal", () => {
    const result = computeCouponDiscount(
      coupon({ code: "MIN", type: "fixed", value: 100, minSubtotalCents: 2500 }),
      1000
    );
    expect("error" in result).toBe(true);
  });
});

describe("pricing with coupon", () => {
  it("reduces taxable base and total", () => {
    const applied = computeCouponDiscount(coupon({ code: "SAVE5", type: "fixed", value: 500 }), 4000);
    expect("error" in applied).toBe(false);
    if ("error" in applied) return;
    const pricing = computePricing([line(4000)], "CA", applied);
    expect(pricing.discountCents).toBe(500);
    expect(pricing.taxableCents).toBe(3500);
    expect(pricing.taxCents).toBe(Math.round((3500 * 950) / 10000));
    expect(pricing.totalCents).toBe(
      pricing.taxableCents + pricing.taxCents + pricing.shippingCents
    );
  });
});
