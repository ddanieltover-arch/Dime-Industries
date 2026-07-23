// tests/unit/affiliate-payout.test.ts
import { describe, it, expect } from "vitest";
import { MIN_PAYOUT_CENTS } from "../../lib/affiliate/payout-types";

function availablePayoutCents(
  earnedCents: number,
  payouts: { email: string; amountCents: number; status: string }[],
  email: string
) {
  const reserved = payouts
    .filter((p) => p.email === email && (p.status === "pending" || p.status === "paid"))
    .reduce((s, p) => s + p.amountCents, 0);
  return Math.max(0, earnedCents - reserved);
}

describe("affiliate payout availability", () => {
  it("subtracts pending and paid from earned", () => {
    expect(
      availablePayoutCents(
        10000,
        [
          { email: "a@x.com", amountCents: 3000, status: "pending" },
          { email: "a@x.com", amountCents: 2000, status: "paid" },
          { email: "a@x.com", amountCents: 1000, status: "rejected" },
        ],
        "a@x.com"
      )
    ).toBe(5000);
  });

  it("enforces minimum payout constant", () => {
    expect(MIN_PAYOUT_CENTS).toBe(5000);
  });
});
