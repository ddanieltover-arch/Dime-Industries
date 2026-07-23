// tests/unit/loyalty-redeem.test.ts
import { describe, it, expect } from "vitest";
import {
  clampRedeemPoints,
  pointsToDiscountCents,
  discountCentsToPoints,
  MIN_REDEEM_POINTS,
} from "../../lib/loyalty/redeem";

describe("loyalty redeem", () => {
  it("converts points to dollars", () => {
    expect(pointsToDiscountCents(100)).toBe(100);
    expect(pointsToDiscountCents(250)).toBe(200);
    expect(discountCentsToPoints(500)).toBe(500);
  });

  it("clamps to balance, min redeem, and 50% of subtotal", () => {
    expect(
      clampRedeemPoints({ requestedPoints: 500, balance: 200, subtotalCents: 10000 })
    ).toEqual({ points: 200, discountCents: 200 });

    expect(
      clampRedeemPoints({ requestedPoints: 50, balance: 500, subtotalCents: 10000 }).points
    ).toBeLessThan(MIN_REDEEM_POINTS);

    // 50% of $20 = $10 = 1000 pts max
    const capped = clampRedeemPoints({
      requestedPoints: 5000,
      balance: 5000,
      subtotalCents: 2000,
    });
    expect(capped.points).toBe(1000);
    expect(capped.discountCents).toBe(1000);
  });
});
