// tests/e2e/home.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("shows homepage content on first visit without age gate", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("dialog", { name: /are you over 21/i })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /award-winning products/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("theme toggle switches between light and dark", async ({ page }) => {
    await page.goto("/");

    // Default theme is dark — toggle to light, then back to dark.
    await page.getByRole("button", { name: /switch to light mode/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: /switch to dark mode/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("button", { name: /switch to light mode/i })).toBeVisible();
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /skip to main content/i })).toBeFocused();
  });

  test("main nav exposes primary destinations", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Shop" })).toHaveAttribute("href", "/shop");
    await expect(nav.getByRole("link", { name: "Promotions" })).toHaveAttribute("href", "/promotions");
    await expect(nav.getByRole("link", { name: "Validate" })).toHaveAttribute("href", "/validate");
    await expect(nav.getByRole("link", { name: "Rewards" })).toHaveAttribute("href", "/rewards");
    await expect(nav.getByRole("link", { name: "Find DIME" })).toHaveAttribute("href", "/locations");
  });

  test("mobile bottom nav exposes primary destinations", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Mobile primary" });
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expect(nav.getByRole("link", { name: "Shop" })).toHaveAttribute("href", "/shop");
    await expect(nav.getByRole("link", { name: "Cart" })).toHaveAttribute("href", "/cart");
    await expect(nav.getByRole("link", { name: "Account" })).toHaveAttribute("href", "/account");
    await expect(nav.getByRole("button", { name: "More" })).toBeVisible();

    await nav.getByRole("button", { name: "More" }).click();
    const more = page.getByRole("dialog", { name: "More" });
    await expect(more.getByRole("link", { name: "Rewards" })).toHaveAttribute("href", "/rewards");
    await expect(more.getByRole("link", { name: "Find DIME" })).toHaveAttribute("href", "/locations");
  });
});
