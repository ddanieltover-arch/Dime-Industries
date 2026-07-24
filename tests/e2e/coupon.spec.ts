// tests/e2e/coupon.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Coupons", () => {
  test("verified visitor can apply SAVE5 on cart", async ({ page, context }) => {
    await context.addCookies([
      { name: "dime_age_verified", value: "1", domain: "localhost", path: "/" },
      { name: "dime_jurisdiction", value: "CA", domain: "localhost", path: "/" },
    ]);

    await page.goto("/product/miami-ice");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("status")).toContainText(/Added to cart/i);

    await page.goto("/cart");
    await page.getByLabel("Coupon code").fill("SAVE5");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText(/Coupon SAVE5 applied/i)).toBeVisible();
  });
});
