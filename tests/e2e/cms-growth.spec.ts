// tests/e2e/cms-growth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("CMS & growth surfaces", () => {
  test("blog index lists posts", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Blog", level: 1 })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("link", { name: /certificates of analysis/i })).toBeVisible();
  });

  test("about page renders", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/About/i, {
      timeout: 30_000,
    });
    await expect(page.getByRole("heading", { name: /Elevate your experience/i })).toBeVisible();
  });

  test("promotions page renders", async ({ page }) => {
    await page.goto("/promotions", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Promotions/i, {
      timeout: 30_000,
    });
    await expect(page.getByRole("heading", { name: /Checkout codes/i })).toBeVisible();
  });

  test("faq page renders", async ({ page }) => {
    await page.goto("/faq", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/FAQ/i, {
      timeout: 30_000,
    });
    await expect(page.getByText(/What is DIME Industries/i)).toBeVisible();
  });

  test("legal pages render", async ({ page }) => {
    await page.goto("/legal/terms", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Terms/i, {
      timeout: 30_000,
    });
    await expect(page.getByRole("navigation", { name: /Legal pages/i })).toBeVisible();
    await page.goto("/cookies", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Cookie/i);
  });

  test("admin redirects unauthenticated visitors to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});
