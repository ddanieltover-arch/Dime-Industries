import { test, expect } from "@playwright/test";

test.describe("Checkout", () => {
  test("cart CTA reaches checkout for verified visitor with items", async ({ page, context }) => {
    await context.addCookies([
      { name: "dime_age_verified", value: "1", domain: "localhost", path: "/" },
      { name: "dime_jurisdiction", value: "CA", domain: "localhost", path: "/" },
    ]);

    await page.goto("/product/live-reserve-gelato-1g");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("status")).toContainText(/Added to cart/i);

    await page.goto("/cart");
    await page.getByRole("link", { name: "Proceed to checkout" }).click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByRole("heading", { name: "Checkout", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /Pay with Bitcoin/i })).toBeVisible();
  });
});
