// tests/e2e/home.spec.ts
//
// Not executed in this sandbox — there's no running Next.js server or
// Playwright browser binaries available here. Written to the same standard
// as code that does run, and should be the first thing wired into CI once
// this repo has a real dev server (Deployment/DevOps Architecture, CI step
// "Playwright E2E" in the pipeline diagram already defines where this runs).

import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("blocks catalog content behind the age gate on first visit", async ({ page }) => {
    await page.goto("/");

    const dialog = page.getByRole("dialog", { name: /age verification required/i });
    await expect(dialog).toBeVisible();

    // Real content must not be reachable while the gate is up.
    await expect(page.getByRole("heading", { name: /Gelato Cartridge/i })).toHaveCount(0);

    // Escape and outside-click must not dismiss a legal gate.
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
  });

  test("confirming 21+ and a launch-state jurisdiction reveals the page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /I'm 21 or older/i }).click();
    await page.getByLabel(/which state are you in/i).selectOption("CA");
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /Every cartridge, tested and dated/i })
    ).toBeVisible();
  });

  test("shows the not-available message for a non-launch state", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /I'm 21 or older/i }).click();
    await page.getByLabel(/which state are you in/i).selectOption("OTHER");
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.getByText(/not yet available in your area/i)).toBeVisible();
  });

  test("under-21 selection shows the blocking message, not the site", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /I'm under 21/i }).click();
    await expect(page.getByText(/must be 21 or older/i)).toBeVisible();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("theme toggle switches between light and dark", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /I'm 21 or older/i }).click();
    await page.getByLabel(/which state are you in/i).selectOption("CA");
    await page.getByRole("button", { name: /continue/i }).click();

    const toggle = page.getByRole("button", { name: /switch to dark mode/i });
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("button", { name: /switch to light mode/i })).toBeVisible();
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /skip to main content/i })).toBeFocused();
  });

  test("main nav exposes the primary shop categories", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Vapes" })).toHaveAttribute("href", "/shop/vapes");
    await expect(nav.getByRole("link", { name: "Edibles" })).toHaveAttribute("href", "/shop/edibles");
    await expect(nav.getByRole("link", { name: "Wholesale" })).toHaveAttribute("href", "/wholesale");
  });
});
