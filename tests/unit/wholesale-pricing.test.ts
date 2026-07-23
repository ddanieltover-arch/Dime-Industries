// tests/unit/wholesale-pricing.test.ts
import { describe, it, expect } from "vitest";
import {
  defaultWholesalePriceCents,
  resolveWholesaleVariantPrice,
  termsLabel,
} from "../../lib/wholesale/pricing";
import { WHOLESALE_PRICE_BPS } from "../../lib/wholesale/types";
import { hasAtLeastRole } from "../../lib/auth/roles";

describe("wholesale pricing", () => {
  it("applies default bps off retail", () => {
    const retail = 10000;
    expect(defaultWholesalePriceCents(retail)).toBe(
      Math.round((retail * WHOLESALE_PRICE_BPS) / 10000)
    );
  });

  it("uses override price and moq when present", () => {
    const variant = {
      id: "v1",
      sku: "X",
      weightOrFormat: "1g",
      retailPriceCents: 10000,
      quantityOnHand: 50,
      thcPct: 70,
      cbdPct: 0.1,
      cbnPct: 0,
    };
    const priced = resolveWholesaleVariantPrice(variant, {
      v1: { variantId: "v1", priceCents: 5500, minQuantity: 10 },
    });
    expect(priced.wholesalePriceCents).toBe(5500);
    expect(priced.minQuantity).toBe(10);
  });

  it("labels payment terms", () => {
    expect(termsLabel("net30")).toBe("NET-30");
    expect(termsLabel("upfront")).toContain("Bitcoin");
  });
});

describe("wholesale role gate", () => {
  it("does not let customer pass wholesale exact gate", () => {
    expect(hasAtLeastRole("customer", "wholesale")).toBe(false);
    expect(hasAtLeastRole("wholesale", "wholesale")).toBe(true);
    expect(hasAtLeastRole("admin", "wholesale")).toBe(true);
  });

  it("lets wholesale pass customer gates", () => {
    expect(hasAtLeastRole("wholesale", "customer")).toBe(true);
  });
});
