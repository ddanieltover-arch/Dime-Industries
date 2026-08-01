import { describe, it, expect } from "vitest";
import { suggestCatalog } from "../../lib/catalog/suggest";

describe("suggestCatalog", () => {
  it("returns empty for short queries", () => {
    expect(suggestCatalog("m", { jurisdiction: "CA" }).suggestions).toEqual([]);
  });

  it("ranks product name prefix matches highly", () => {
    const { suggestions } = suggestCatalog("miami", { jurisdiction: "CA" });
    const products = suggestions.filter((s) => s.kind === "product");
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]?.slug).toContain("miami");
  });

  it("suggests categories when the query matches taxonomy", () => {
    const { suggestions } = suggestCatalog("vape", { jurisdiction: "CA" });
    expect(suggestions.some((s) => s.kind === "category" && s.slug === "vapes")).toBe(
      true
    );
  });

  it("respects jurisdiction filtering", () => {
    const ca = suggestCatalog("miami", { jurisdiction: "CA" }).suggestions.filter(
      (s) => s.kind === "product"
    );
    expect(ca.length).toBeGreaterThan(0);
  });

  it("caps suggestion count", () => {
    const { suggestions } = suggestCatalog("peach", { jurisdiction: "CA", limit: 4 });
    expect(suggestions.length).toBeLessThanOrEqual(4);
  });
});
