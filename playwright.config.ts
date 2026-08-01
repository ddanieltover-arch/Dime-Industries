// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const isRemoteTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL) && process.env.CI === "true";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 90_000,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 60_000,
  },
  // Local runs start Next; staging/production e2e points PLAYWRIGHT_BASE_URL at a live host.
  ...(isRemoteTarget
    ? {}
    : {
        webServer: {
          // Prefer a pre-started server (`reuseExistingServer`). Default to `dev` so local
          // e2e works without a full production build; override with PLAYWRIGHT_WEB_SERVER
          // (e.g. `npm run start -- --port 3000`) after `npm run build`.
          command: process.env.PLAYWRIGHT_WEB_SERVER ?? "npm run dev -- --port 3000",
          url: baseURL,
          reuseExistingServer: true,
          timeout: 180_000,
        },
      }),
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
