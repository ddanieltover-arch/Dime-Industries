// tests/unit/security-hardening.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  rateLimit,
  resetRateLimitBuckets,
  clientIpFromRequest,
} from "../../lib/security/rate-limit";
import { SECURITY_HEADERS } from "../../lib/security/headers";
import { isDemoAuthAllowed } from "../../lib/auth/config";
import {
  absoluteUrl,
  SEO_DISALLOW_PATHS,
  SITE_URL,
} from "../../lib/seo/site";
import { hasAtLeastRole } from "../../lib/auth/roles";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimitBuckets());

  it("allows requests under the limit", () => {
    const a = rateLimit("k", 2, 60_000, 1_000);
    const b = rateLimit("k", 2, 60_000, 1_001);
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
    expect(b.remaining).toBe(0);
  });

  it("blocks when limit exceeded and recovers after window", () => {
    rateLimit("k", 1, 1_000, 0);
    const blocked = rateLimit("k", 1, 1_000, 10);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    const ok = rateLimit("k", 1, 1_000, 1_001);
    expect(ok.allowed).toBe(true);
  });
});

describe("clientIpFromRequest", () => {
  it("prefers first x-forwarded-for hop", () => {
    const req = new Request("http://localhost/api", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientIpFromRequest(req)).toBe("1.2.3.4");
  });
});

describe("security headers", () => {
  it("includes frame denial and nosniff", () => {
    const keys = SECURITY_HEADERS.map((h) => h.key);
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("Content-Security-Policy");
  });
});

describe("isDemoAuthAllowed", () => {
  it("allows demo in non-production without Supabase", () => {
    expect(
      isDemoAuthAllowed({
        NODE_ENV: "development",
      })
    ).toBe(true);
  });

  it("blocks demo in production without explicit allow", () => {
    expect(
      isDemoAuthAllowed({
        NODE_ENV: "production",
      })
    ).toBe(false);
  });

  it("allows demo in production when ALLOW_DEMO_AUTH=true", () => {
    expect(
      isDemoAuthAllowed({
        NODE_ENV: "production",
        ALLOW_DEMO_AUTH: "true",
      })
    ).toBe(true);
  });

  it("disables demo when Supabase is configured", () => {
    expect(
      isDemoAuthAllowed({
        NODE_ENV: "development",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      })
    ).toBe(false);
  });
});

describe("SEO helpers", () => {
  it("builds absolute URLs", () => {
    expect(absoluteUrl("/shop")).toBe(`${SITE_URL}/shop`);
    expect(absoluteUrl("")).toBe(SITE_URL);
  });

  it("disallows private surfaces", () => {
    expect(SEO_DISALLOW_PATHS).toContain("/admin");
    expect(SEO_DISALLOW_PATHS).toContain("/checkout");
    expect(SEO_DISALLOW_PATHS).toContain("/wishlist");
  });
});

describe("lateral role gates", () => {
  it("does not let customer pass wholesale gate", () => {
    expect(hasAtLeastRole("customer", "wholesale")).toBe(false);
    expect(hasAtLeastRole("wholesale", "wholesale")).toBe(true);
  });
});
