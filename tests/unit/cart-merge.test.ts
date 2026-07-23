// tests/unit/cart-merge.test.ts
import { describe, it, expect } from "vitest";
import { mergeCarts } from "../../lib/cart/logic";
import type { CartLine } from "../../lib/cart/types";

const line = (id: string, qty: number, max = 10): CartLine => ({
  variantId: id,
  quantity: qty,
  productSlug: "x",
  productName: "X",
  lineName: "Signature",
  weightOrFormat: "1g",
  sku: "X",
  unitPriceCents: 1000,
  thcPct: 70,
  cbdPct: 0.1,
  maxQuantity: max,
});

describe("mergeCarts", () => {
  it("adds guest quantities onto matching lines capped by max", () => {
    const merged = mergeCarts([line("a", 2, 5)], [line("a", 4, 5)]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.quantity).toBe(5);
  });

  it("appends new guest lines", () => {
    const merged = mergeCarts([line("a", 1)], [line("b", 2)]);
    expect(merged.map((l) => l.variantId).sort()).toEqual(["a", "b"]);
  });
});
