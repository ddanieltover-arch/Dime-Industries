import { test, expect } from "@playwright/test";

test.describe("Cart", () => {
  test("verified visitor can add a product to cart", async ({ page, context }) => {
    await context.addCookies([
      { name: "dime_age_verified", value: "1", domain: "localhost", path: "/", httpOnly: true },
      { name: "dime_jurisdiction", value: "CA", domain: "localhost", path: "/" },
    ]);

    await page.goto("/product/miami-ice");
    await page.getByRole("button", { name: "Add to cart", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(/Added to cart/i, { timeout: 20_000 });

    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "Cart", level: 1 })).toBeVisible();
    await expect(page.getByText(/Miami Ice/i)).toBeVisible();
  });
});
