// tests/unit/launch-status.test.ts
import { describe, it, expect } from "vitest";
import { getLaunchStatus } from "../../lib/ops/launch-status";
import { getOrderRepository } from "../../lib/checkout/repository";

describe("getLaunchStatus", () => {
  it("blocks demo auth in production", () => {
    const status = getLaunchStatus({
      NODE_ENV: "production",
      ALLOW_DEMO_AUTH: "true",
    });
    const demo = status.checks.find((c) => c.id === "demo_auth");
    expect(demo?.ok).toBe(false);
    expect(status.readyForPublicTraffic).toBe(false);
  });

  it("is ready in production with supabase + app url and no demo", () => {
    const status = getLaunchStatus({
      NODE_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      NEXT_PUBLIC_APP_URL: "https://www.dimeindustries.us",
      RESEND_API_KEY: "re_x",
      NEXT_PUBLIC_SENTRY_DSN: "https://sentry.example/1",
      DATABASE_URL: "postgres://localhost/dime",
      ORDERS_PERSISTENCE: "database",
    });
    expect(status.readyForPublicTraffic).toBe(true);
    expect(status.checks.find((c) => c.id === "orders_persistence")?.ok).toBe(true);
    expect(status.checks.find((c) => c.id === "growth_persistence")?.ok).toBe(true);
    expect(status.checks.find((c) => c.id === "persistence_mode")?.ok).toBe(true);
    expect(status.checks.find((c) => c.id === "inventory_reservation")?.ok).toBe(true);
    expect(status.checks.find((c) => c.id === "paybis_webhook_persist")?.ok).toBe(true);
  });

  it("blocks live Paybis without webhook secret in production", () => {
    const status = getLaunchStatus({
      NODE_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      NEXT_PUBLIC_APP_URL: "https://www.dimeindustries.us",
      PAYBIS_API_KEY: "k",
      PAYBIS_API_SECRET: "s",
    });
    const paybis = status.checks.find((c) => c.id === "paybis_webhook");
    expect(paybis?.ok).toBe(false);
    expect(status.readyForPublicTraffic).toBe(false);
  });
});

describe("getOrderRepository", () => {
  it("exposes cookie mode until DB swap", () => {
    expect(getOrderRepository().mode).toBe("cookie");
  });
});
