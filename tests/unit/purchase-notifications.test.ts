import { describe, expect, it, vi } from "vitest";
import {
  PURCHASE_TOAST_DISMISS_KEY,
  createPurchaseNotification,
  dismissPurchaseToast,
  isPurchaseToastDismissed,
  productHref,
  shortenProductName,
} from "@/lib/social-proof/purchase-notifications";
import { getSocialProofProducts } from "@/lib/social-proof/products";

describe("purchase social-proof helpers", () => {
  it("shortens long SEO product titles", () => {
    expect(shortenProductName("Forbidden Apple Vape – Dime Industries")).toBe(
      "Forbidden Apple Vape",
    );
    expect(
      shortenProductName(
        "5th-Gen Battery: Temperature Control 510 Thread Extra Long Marketing Title",
        42,
      ).endsWith("…"),
    ).toBe(true);
  });

  it("builds product hrefs", () => {
    expect(productHref("banana-mac")).toBe("/product/banana-mac");
  });

  it("creates randomized notifications from the catalog pool", () => {
    const products = getSocialProofProducts();
    expect(products.length).toBeGreaterThan(5);
    expect(products.every((p) => p.imageUrl)).toBe(true);

    const a = createPurchaseNotification(products);
    const b = createPurchaseNotification(products, a?.product.slug);
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(a!.firstName.length).toBeGreaterThan(1);
    expect(a!.state.length).toBeGreaterThan(2);
    expect(a!.product.imageUrl).toBeTruthy();
    expect(products.some((p) => p.slug === a!.product.slug)).toBe(true);
  });

  it("stores dismiss for the current visit via sessionStorage", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: vi.fn((k: string) => store.get(k) ?? null),
      setItem: vi.fn((k: string, v: string) => {
        store.set(k, v);
      }),
    };

    expect(isPurchaseToastDismissed(storage)).toBe(false);
    dismissPurchaseToast(storage);
    expect(storage.setItem).toHaveBeenCalledWith(PURCHASE_TOAST_DISMISS_KEY, "1");
    expect(isPurchaseToastDismissed(storage)).toBe(true);
  });
});
