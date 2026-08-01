import { test, expect } from "@playwright/test";

test.describe("Checkout", () => {
  test("cart CTA reaches checkout for verified visitor with items", async ({ page, context }) => {
    await context.addCookies([
      { name: "dime_age_verified", value: "1", domain: "localhost", path: "/", httpOnly: true },
      { name: "dime_jurisdiction", value: "CA", domain: "localhost", path: "/" },
    ]);

    await page.goto("/product/miami-ice", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Add to cart", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(/Added to cart/i, { timeout: 30_000 });

    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Proceed to checkout" }).click();
    await expect(page).toHaveURL(/\/checkout/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Checkout", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /Pay with Bitcoin/i })).toBeVisible();
  });
});
