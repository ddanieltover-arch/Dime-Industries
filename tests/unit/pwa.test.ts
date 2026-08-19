import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import manifest from "@/app/manifest";
import {
  isPwaBypassedPath,
  isPwaStaticAssetPath,
  PWA_OFFLINE_PATH,
  PWA_SW_PATH,
} from "@/lib/pwa/cache-policy";
import { SECURITY_HEADERS } from "@/lib/security/headers";

describe("PWA cache policy", () => {
  it("bypasses sensitive storefront surfaces", () => {
    expect(isPwaBypassedPath("/api/search/suggest")).toBe(true);
    expect(isPwaBypassedPath("/admin/cms")).toBe(true);
    expect(isPwaBypassedPath("/account/orders")).toBe(true);
    expect(isPwaBypassedPath("/checkout")).toBe(true);
    expect(isPwaBypassedPath("/cart")).toBe(true);
    expect(isPwaBypassedPath("/login")).toBe(true);
    expect(isPwaBypassedPath("/shop")).toBe(false);
  });

  it("does not intercept hashed Next.js bundles", () => {
    expect(isPwaStaticAssetPath("/_next/static/chunks/main.js")).toBe(false);
    expect(isPwaStaticAssetPath("/_next/static/css/app.css")).toBe(false);
    expect(isPwaStaticAssetPath("/brand/logo.png")).toBe(true);
    expect(isPwaStaticAssetPath("/fonts/display.woff2")).toBe(true);
    expect(isPwaStaticAssetPath("/shop")).toBe(false);
  });

  it("exposes SW and offline paths", () => {
    expect(PWA_SW_PATH).toBe("/sw.js");
    expect(PWA_OFFLINE_PATH).toBe("/offline.html");
  });

  it("times out hung HTML navigations and bumps cache version", () => {
    const sw = readFileSync(join(process.cwd(), "public/sw.js"), "utf8");
    expect(sw).toContain('const VERSION = "dime-pwa-v3"');
    expect(sw).toContain("AbortSignal.timeout(8000)");
    expect(sw).not.toContain('const VERSION = "dime-pwa-v2"');
  });
});

describe("web app manifest", () => {
  it("is installable standalone with icons", () => {
    const m = manifest();
    expect(m.name).toBe("DIME Industries");
    expect(m.short_name).toBe("DIME");
    expect(m.display).toBe("standalone");
    expect(m.start_url).toContain("/");
    expect(m.icons?.length).toBeGreaterThan(0);
    expect(m.theme_color).toBe("#0e0e0e");
  });
});

describe("PWA CSP", () => {
  it("allows same-origin workers and manifests", () => {
    const csp = SECURITY_HEADERS.find((h) => h.key === "Content-Security-Policy")?.value ?? "";
    expect(csp).toContain("worker-src 'self'");
    expect(csp).toContain("manifest-src 'self'");
  });
});
