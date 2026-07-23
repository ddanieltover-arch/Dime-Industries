import { describe, it, expect } from "vitest";
import {
  listProducts,
  getProductBySlug,
  potencyBandFor,
  parseCatalogSearchParams,
} from "../../lib/catalog/query";

describe("catalog query layer", () => {
  it("filters by category and strain", () => {
    const result = listProducts({ category: "vapes", strain: "sativa", jurisdiction: "CA" });
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((p) => p.strainType === "sativa")).toBe(true);
  });

  it("hides MA-only products from CA jurisdiction", () => {
    const ca = getProductBySlug("state-exclusive-jet-fuel-1g", "CA");
    const ma = getProductBySlug("state-exclusive-jet-fuel-1g", "MA");
    expect(ca).toBeNull();
    expect(ma).not.toBeNull();
  });

  it("maps potency bands", () => {
    expect(potencyBandFor(10)).toBe("low");
    expect(potencyBandFor(75)).toBe("high");
    expect(potencyBandFor(91)).toBe("very-high");
  });

  it("supports text search across name and line", () => {
    const result = listProducts({ q: "gelato", jurisdiction: "CA" });
    expect(result.items.some((p) => p.slug.includes("gelato"))).toBe(true);
  });

  it("sorts by price ascending", () => {
    const result = listProducts({ sort: "price-asc", jurisdiction: "CA", pageSize: 50 });
    const prices = result.items.map((p) => p.retailPriceCents);
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  it("parses search params safely", () => {
    const filters = parseCatalogSearchParams({
      strain: "hybrid",
      potency: "very-high",
      sort: "potency-desc",
      page: "2",
    });
    expect(filters.strain).toBe("hybrid");
    expect(filters.potency).toBe("very-high");
    expect(filters.sort).toBe("potency-desc");
    expect(filters.page).toBe(2);
  });

  it("rejects invalid strain values", () => {
    const filters = parseCatalogSearchParams({ strain: "not-a-strain" });
    expect(filters.strain).toBeUndefined();
  });
});
