import { describe, expect, it } from "vitest";
import {
  applyCategoryNameOverrides,
  type CategoryOverrides,
} from "@/lib/admin/categories-logic";
import {
  buildAnalyticsSnapshot,
  buildLowStockRows,
  buildPaidOrderRows,
  toCsv,
} from "@/lib/admin/analytics";
import type { CatalogProduct } from "@/lib/catalog/types";
import type { CheckoutOrder } from "@/lib/checkout/types";

const product = (partial: Partial<CatalogProduct> & Pick<CatalogProduct, "id" | "slug" | "categorySlug">): CatalogProduct => ({
  name: partial.name ?? "Test",
  description: "",
  categoryName: partial.categoryName ?? "Vapes",
  lineSlug: "signature",
  lineName: "Signature",
  strainType: "hybrid",
  status: partial.status ?? "active",
  allowedJurisdictions: ["CA", "MA"],
  effects: [],
  coaUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  popularityScore: 1,
  imageUrl: null,
  galleryUrls: [],
  brandPath: null,
  variants: partial.variants ?? [
    {
      id: "v1",
      sku: "SKU-1",
      weightOrFormat: "1g",
      retailPriceCents: 1000,
      thcPct: 70,
      cbdPct: 0,
      cbnPct: null,
      quantityOnHand: 10,
    },
  ],
  ...partial,
});

describe("category name overrides", () => {
  it("renames matching categorySlug", () => {
    const overrides: CategoryOverrides = { vapes: { name: "Vape Hardware" } };
    const [next] = applyCategoryNameOverrides(
      [product({ id: "1", slug: "a", categorySlug: "vapes", categoryName: "Vapes" })],
      overrides
    );
    expect(next.categoryName).toBe("Vape Hardware");
  });
});

describe("analytics helpers", () => {
  it("aggregates catalog and order KPIs", () => {
    const catalog = [
      product({ id: "1", slug: "a", categorySlug: "vapes", categoryName: "Vapes" }),
      product({
        id: "2",
        slug: "b",
        categorySlug: "edibles",
        categoryName: "Edibles",
        status: "draft",
        variants: [
          {
            id: "v2",
            sku: "SKU-2",
            weightOrFormat: "100mg",
            retailPriceCents: 2000,
            thcPct: 10,
            cbdPct: 0,
            cbnPct: null,
            quantityOnHand: 5,
          },
        ],
      }),
    ];
    const orders = [
      {
        id: "o1",
        email: "a@b.com",
        status: "payment_confirmed",
        totalCents: 5000,
        createdAt: "2026-01-02T00:00:00.000Z",
        paidAt: "2026-01-02T01:00:00.000Z",
      },
      {
        id: "o2",
        email: "c@d.com",
        status: "pending",
        totalCents: 1000,
        createdAt: "2026-01-03T00:00:00.000Z",
        paidAt: null,
      },
    ] as CheckoutOrder[];

    const snap = buildAnalyticsSnapshot({
      catalog,
      orders,
      pendingReviews: 2,
      loyaltyAccounts: 4,
      openReturns: 1,
    });
    expect(snap.orders.paidCount).toBe(1);
    expect(snap.orders.revenueCents).toBe(5000);
    expect(snap.catalog.active).toBe(1);
    expect(snap.catalog.draft).toBe(1);
    expect(snap.catalog.lowStock).toBe(2);
    expect(snap.categories).toHaveLength(2);
    expect(buildPaidOrderRows(orders)).toHaveLength(1);
    expect(buildLowStockRows(catalog)[0]?.quantityOnHand).toBe(5);
  });

  it("escapes CSV cells", () => {
    expect(toCsv(["a", "b"], [["x,y", 'say "hi"']])).toContain('"x,y"');
    expect(toCsv(["a", "b"], [["x,y", 'say "hi"']])).toContain('"say ""hi"""');
  });
});

describe("site settings defaults", () => {
  it("launch jurisdictions constant aligns with CA/MA", async () => {
    const { LAUNCH_JURISDICTIONS } = await import("@/lib/compliance/jurisdictions");
    expect([...LAUNCH_JURISDICTIONS]).toEqual(["CA", "MA"]);
  });

  it("exports feature-flag helpers", async () => {
    const store = await import("@/lib/admin/site-settings-store");
    expect(typeof store.isWholesaleEnabled).toBe("function");
    expect(typeof store.isVendorOnboardingEnabled).toBe("function");
    expect(typeof store.getActiveLaunchJurisdictions).toBe("function");
    expect(typeof store.isActiveLaunchJurisdiction).toBe("function");
    expect(typeof store.activeJurisdictionsLabel).toBe("function");
    expect(store.DEFAULT_SITE_SETTINGS.jurisdictions).toEqual(["CA", "MA"]);
    expect(store.DEFAULT_SITE_SETTINGS.featureFlags.wholesaleEnabled).toBe(true);
    expect(store.DEFAULT_SITE_SETTINGS.featureFlags.vendorOnboarding).toBe(false);
  });
});
