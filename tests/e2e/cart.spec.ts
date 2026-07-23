import { test, expect } from "@playwright/test";

test.describe("Cart", () => {
  test("verified visitor can add a product to cart", async ({ page, context }) => {
    await context.addCookies([
      { name: "dime_age_verified", value: "1", domain: "localhost", path: "/" },
      { name: "dime_jurisdiction", value: "CA", domain: "localhost", path: "/" },
    ]);

    await page.goto("/product/live-reserve-gelato-1g");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("status")).toContainText(/Added to cart/i);

    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "Cart", level: 1 })).toBeVisible();
    await expect(page.getByText("Gelato Cartridge")).toBeVisible();
  });
});
