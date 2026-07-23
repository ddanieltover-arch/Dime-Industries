import { describe, it, expect } from "vitest";
import {
  addToCart,
  cartSnapshot,
  hydrateCart,
  mergeCarts,
  removeFromCart,
  updateCartQuantity,
  toCartLine,
} from "../../lib/cart/logic";
import type { CatalogProduct } from "../../lib/catalog/types";
import type { CartLookup } from "../../lib/cart/logic";

const product: CatalogProduct = {
  id: "p1",
  slug: "test-product",
  name: "Test Product",
  description: "desc",
  categorySlug: "vapes",
  categoryName: "Vapes",
  lineSlug: "signature",
  lineName: "Signature",
  strainType: "hybrid",
  status: "active",
  allowedJurisdictions: ["CA", "MA"],
  effects: [],
  coaUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  popularityScore: 50,
  variants: [
    {
      id: "v1",
      sku: "TEST-1G",
      weightOrFormat: "1g",
      retailPriceCents: 4000,
      thcPct: 80,
      cbdPct: 0.2,
      cbnPct: null,
      quantityOnHand: 10,
    },
    {
      id: "v2",
      sku: "TEST-2G",
      weightOrFormat: "2g",
      retailPriceCents: 6000,
      thcPct: 78,
      cbdPct: 0.2,
      cbnPct: null,
      quantityOnHand: 5,
    },
  ],
};

const lookup: CartLookup = {
  findVariant(variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    return variant ? { product, variant } : null;
  },
};

describe("cart logic", () => {
  it("adds a new line and computes subtotal", () => {
    const lines = addToCart([], product, product.variants[0]!, 2);
    const snap = cartSnapshot(lines);
    expect(snap.itemCount).toBe(2);
    expect(snap.subtotalCents).toBe(8000);
  });

  it("increments quantity when adding the same variant", () => {
    let lines = addToCart([], product, product.variants[0]!, 1);
    lines = addToCart(lines, product, product.variants[0]!, 2);
    expect(lines).toHaveLength(1);
    expect(lines[0]!.quantity).toBe(3);
  });

  it("removes a line", () => {
    const lines = addToCart([], product, product.variants[0]!, 1);
    expect(removeFromCart(lines, "v1")).toHaveLength(0);
  });

  it("updates quantity and removes when set to 0", () => {
    let lines = addToCart([], product, product.variants[0]!, 2);
    lines = updateCartQuantity(lines, "v1", 1, lookup);
    expect(lines[0]!.quantity).toBe(1);
    lines = updateCartQuantity(lines, "v1", 0, lookup);
    expect(lines).toHaveLength(0);
  });

  it("hydrates from raw inputs and drops unknown variants", () => {
    const lines = hydrateCart(
      [
        { variantId: "v1", quantity: 2 },
        { variantId: "missing", quantity: 1 },
      ],
      lookup
    );
    expect(lines).toHaveLength(1);
    expect(lines[0]!.sku).toBe("TEST-1G");
  });

  it("merges guest cart into existing cart", () => {
    const existing = [toCartLine(product, product.variants[0]!, 1)];
    const guest = [toCartLine(product, product.variants[0]!, 2), toCartLine(product, product.variants[1]!, 1)];
    const merged = mergeCarts(existing, guest);
    expect(merged).toHaveLength(2);
    expect(merged.find((l) => l.variantId === "v1")!.quantity).toBe(3);
  });

  it("clamps quantity to stock and max", () => {
    const line = toCartLine(product, product.variants[1]!, 99);
    expect(line.quantity).toBe(5);
  });
});
