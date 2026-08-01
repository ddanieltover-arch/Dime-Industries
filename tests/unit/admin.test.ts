import { describe, it, expect } from "vitest";
import { withCatalogSource, listProducts, getCatalogSource } from "../../lib/catalog/query";
import type { CatalogProduct } from "../../lib/catalog/types";
import { adminOrderKpis } from "../../lib/admin/orders-admin";
import type { CheckoutOrder } from "../../lib/checkout/types";
import { hasProductOverride } from "../../lib/admin/catalog-override-logic";
import { hasAtLeastRole } from "../../lib/auth/roles";

const sample: CatalogProduct = {
  id: "p-test",
  slug: "admin-test-sku",
  name: "Admin Test",
  description: "x",
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
  popularityScore: 1,
  variants: [
    {
      id: "v-test",
      sku: "ADM-1G",
      weightOrFormat: "1g",
      retailPriceCents: 999,
      thcPct: 70,
      cbdPct: 0.1,
      cbnPct: null,
      quantityOnHand: 3,
    },
  ],
};

describe("withCatalogSource", () => {
  it("temporarily swaps catalog for queries", () => {
    const result = withCatalogSource([sample], () =>
      listProducts({ jurisdiction: "CA", q: "Admin Test" })
    );
    expect(result.total).toBe(1);
    expect(result.items[0]?.retailPriceCents).toBe(999);
    // restored
    expect(getCatalogSource().some((p) => p.id === "p-test")).toBe(false);
  });
});

describe("admin order KPIs", () => {
  it("computes revenue from paid orders", () => {
    const orders = [
      {
        id: "1",
        status: "payment_confirmed",
        totalCents: 5000,
      },
      {
        id: "2",
        status: "pending",
        totalCents: 9000,
      },
    ] as CheckoutOrder[];
    const kpis = adminOrderKpis(orders);
    expect(kpis.revenueCents).toBe(5000);
    expect(kpis.paidCount).toBe(1);
    expect(kpis.pendingCount).toBe(1);
  });
});

describe("admin role gate", () => {
  it("allows admin into admin routes and blocks customer", () => {
    expect(hasAtLeastRole("admin", "admin")).toBe(true);
    expect(hasAtLeastRole("customer", "admin")).toBe(false);
    expect(hasAtLeastRole("admin", "customer")).toBe(true);
  });
});

describe("product overrides (not create)", () => {
  it("detects name/status/price overrides only", () => {
    expect(hasProductOverride({}, "p-1")).toBe(false);
    expect(hasProductOverride({ "p-1": { name: "Renamed" } }, "p-1")).toBe(true);
    expect(hasProductOverride({ "p-1": { status: "draft" } }, "p-1")).toBe(true);
    expect(
      hasProductOverride({ "p-1": { variants: { v1: { retailPriceCents: 100 } } } }, "p-1")
    ).toBe(true);
  });
});
