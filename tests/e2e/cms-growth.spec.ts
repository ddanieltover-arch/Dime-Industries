// tests/e2e/cms-growth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("CMS & growth surfaces", () => {
  test("about page renders from CMS", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/About/i);
  });

  test("blog index lists posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "Blog", level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /certificates of analysis/i })).toBeVisible();
  });

  test("admin redirects unauthenticated visitors to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});
