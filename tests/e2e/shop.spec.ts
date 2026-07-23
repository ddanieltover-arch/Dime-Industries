import { test, expect } from "@playwright/test";

test.describe("Shop catalog", () => {
  test("age gate blocks shop until verified", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("verified visitor can browse shop and open a product", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "dime_age_verified",
        value: "1",
        domain: "localhost",
        path: "/",
      },
      {
        name: "dime_jurisdiction",
        value: "CA",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/shop");
    await expect(page.getByRole("heading", { name: "Shop", level: 1 })).toBeVisible();
    await expect(page.getByText(/Showing/)).toBeVisible();

    const firstProduct = page.locator('a[href^="/product/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByText("THC")).toBeVisible();
  });
});
