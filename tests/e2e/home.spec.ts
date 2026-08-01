// tests/e2e/home.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("blocks catalog content behind the age gate on first visit", async ({ page }) => {
    await page.goto("/");

    const dialog = page.getByRole("dialog", { name: /are you over 21/i });
    await expect(dialog).toBeVisible();

    // Real content must not be reachable while the gate is up.
    await expect(page.getByRole("heading", { name: /Gelato Cartridge/i })).toHaveCount(0);

    // Escape and outside-click must not dismiss a legal gate.
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
  });

  test("confirming 21+ reveals the page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /^yes$/i }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /award-winning products/i })).toBeVisible();
  });

  test("under-21 selection shows the blocking message, not the site", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /^no$/i }).click();
    await expect(page.getByText(/must be 21 or older/i)).toBeVisible();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("theme toggle switches between light and dark", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^yes$/i }).click();

    // Default theme is dark — toggle to light, then back to dark.
    await page.getByRole("button", { name: /switch to light mode/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: /switch to dark mode/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("button", { name: /switch to light mode/i })).toBeVisible();
  });

  test("skip link moves focus to main content", async ({ page, context }) => {
    // Age gate autofocuses its heading; verify skip link once the gate is cleared.
    await context.addCookies([
      { name: "dime_age_verified", value: "1", domain: "localhost", path: "/", httpOnly: true },
    ]);
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
    await page.getByRole("button", { name: /^yes$/i }).click();

    const nav = page.getByRole("navigation", { name: "Mobile primary" });
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expect(nav.getByRole("link", { name: "Shop" })).toHaveAttribute("href", "/shop");
    await expect(nav.getByRole("link", { name: "Cart" })).toHaveAttribute("href", "/cart");
    await expect(nav.getByRole("link", { name: "Rewards" })).toHaveAttribute("href", "/rewards");
    await expect(nav.getByRole("link", { name: "Account" })).toHaveAttribute("href", "/account");
  });
});
