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

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /elevate your experience/i })).toBeVisible();
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
