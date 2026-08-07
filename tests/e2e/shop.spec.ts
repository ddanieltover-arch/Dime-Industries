import { test, expect } from "@playwright/test";

test.describe("Shop catalog", () => {
  test("visitor can browse shop and open a product", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "dime_age_verified",
        value: "1",
        domain: "localhost",
        path: "/",
        httpOnly: true,
      },
      {
        name: "dime_jurisdiction",
        value: "CA",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/shop", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Shop", level: 1 })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/Showing/)).toBeVisible();

    const firstProduct = page.locator('a[href^="/product/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("dt", { hasText: "THC" }).first()).toBeVisible({ timeout: 15_000 });
  });
});
