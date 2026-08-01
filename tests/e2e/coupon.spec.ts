// tests/e2e/coupon.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Coupons", () => {
  test("verified visitor can apply SAVE5 on cart", async ({ page, context }) => {
    await context.addCookies([
      { name: "dime_age_verified", value: "1", domain: "localhost", path: "/", httpOnly: true },
      { name: "dime_jurisdiction", value: "CA", domain: "localhost", path: "/" },
    ]);

    await page.goto("/product/miami-ice", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Add to cart", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(/Added to cart/i, { timeout: 30_000 });

    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Coupon code").fill("SAVE5");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText(/Coupon SAVE5 applied/i)).toBeVisible({ timeout: 20_000 });
  });
});
