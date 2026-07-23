// tests/unit/inventory-logic.test.ts
import { describe, it, expect } from "vitest";
import {
  applyRelease,
  applyReserve,
  canReserve,
  collapseReserveLines,
} from "../../lib/inventory/logic";

describe("inventory reservation logic", () => {
  it("canReserve requires positive qty and enough stock", () => {
    expect(canReserve(5, 3)).toBe(true);
    expect(canReserve(2, 3)).toBe(false);
    expect(canReserve(5, 0)).toBe(false);
  });

  it("applyReserve decrements or returns null", () => {
    expect(applyReserve(10, 4)).toBe(6);
    expect(applyReserve(2, 3)).toBeNull();
  });

  it("applyRelease restores stock", () => {
    expect(applyRelease(6, 4)).toBe(10);
  });

  it("collapseReserveLines merges duplicate variants", () => {
    expect(
      collapseReserveLines([
        { variantId: "a", quantity: 1 },
        { variantId: "b", quantity: 2 },
        { variantId: "a", quantity: 3 },
      ])
    ).toEqual([
      { variantId: "a", quantity: 4 },
      { variantId: "b", quantity: 2 },
    ]);
  });
});
