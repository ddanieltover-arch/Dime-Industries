// lib/ops/launch-status.ts
import { isDemoAuthAllowed, isSupabaseConfigured } from "@/lib/auth/config";
import { isOrdersDatabaseMode } from "@/lib/checkout/repository";

export type LaunchCheckSeverity = "blocker" | "warning" | "info";

export type LaunchCheck = {
  id: string;
  ok: boolean;
  severity: LaunchCheckSeverity;
  message: string;
};

export type LaunchStatus = {
  checkedAt: string;
  environment: string;
  softLaunch: boolean;
  readyForPublicTraffic: boolean;
  checks: LaunchCheck[];
};

type Env = {
  NODE_ENV?: string;
  ALLOW_DEMO_AUTH?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  PAYBIS_API_KEY?: string;
  PAYBIS_API_SECRET?: string;
  PAYBIS_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  DATABASE_URL?: string;
  ORDERS_PERSISTENCE?: string;
};

/**
 * Soft-launch / production configuration review — no secret values returned.
 * Used by /api/ready and the admin launch status panel.
 */
export function getLaunchStatus(env: Env = process.env): LaunchStatus {
  const environment = env.NODE_ENV ?? "development";
  const isProd = environment === "production";
  const supabase = isSupabaseConfigured(env);
  const demoAllowed = isDemoAuthAllowed(env);
  const paybisKeys = Boolean(env.PAYBIS_API_KEY?.trim() && env.PAYBIS_API_SECRET?.trim());
  const paybisWebhook = Boolean(env.PAYBIS_WEBHOOK_SECRET?.trim());
  const resend = Boolean(env.RESEND_API_KEY?.trim());
  const appUrl = Boolean(env.NEXT_PUBLIC_APP_URL?.trim());
  const sentry = Boolean(env.NEXT_PUBLIC_SENTRY_DSN?.trim());
  const ordersDb = isOrdersDatabaseMode(env);

  const checks: LaunchCheck[] = [
    {
      id: "orders_persistence",
      ok: ordersDb,
      severity: ordersDb ? "info" : "warning",
      message: ordersDb
        ? "Orders use commerce_orders (DATABASE_URL + ORDERS_PERSISTENCE auto/database)."
        : "Orders still cookie-scoped — set DATABASE_URL (and ORDERS_PERSISTENCE=database|auto) for webhook-safe persistence.",
    },
    {
      id: "growth_persistence",
      ok: ordersDb,
      severity: ordersDb ? "info" : "warning",
      message: ordersDb
        ? "Cart, wishlist, CMS, coupons, loyalty, affiliate, catalog overrides, and inventory use commerce_* tables when DATABASE_URL is set."
        : "Growth stores still cookie-scoped until DATABASE_URL enables persistence.",
    },
    {
      id: "persistence_mode",
      ok: ordersDb,
      severity: ordersDb ? "info" : "warning",
      message: ordersDb
        ? "Core commerce persistence is database-backed, including wishlist and inventory reservation."
        : "Commerce stores without DATABASE_URL still use session cookies — not fully multi-instance safe.",
    },
    {
      id: "inventory_reservation",
      ok: ordersDb,
      severity: ordersDb ? "info" : "warning",
      message: ordersDb
        ? "Checkout reserves stock atomically via commerce_inventory (release on cancel/reject)."
        : "Inventory reservation inactive until DATABASE_URL enables growth persistence.",
    },
    {
      id: "coa_rewards",
      ok: true,
      severity: "info",
      message:
        process.env.REWARDS_API_BASE?.trim() && process.env.REWARDS_API_BASE.trim() !== "off"
          ? "COA defaults to DIME Heroku lab host; Rewards REST sync configured."
          : "COA defaults to DIME Heroku lab host (/api/coas). Rewards stays local loyalty until REWARDS_API_BASE + key (rewards.dimeindustries.com is OAuth SPA, not REST).",
    },
    {
      id: "reference_pricing",
      ok: true,
      severity: "info",
      message:
        "Catalog uses REFERENCE_PRICING from Eaze CA (+ Rolling Releaf MA notes). Edibles/rosin/collabs without marketplace hits still use documented bands — override via lib/catalog/reference-price-sheet.ts.",
    },
    {
      id: "assistant",
      ok: true,
      severity: "info",
      message:
        process.env.ASSISTANT_API_BASE?.trim() === "off" ||
        process.env.ASSISTANT_API_BASE?.trim() === "mock"
          ? "AI Assistant forced to mock mode (ASSISTANT_API_BASE=off)."
          : "AI Assistant defaults to DIME Budtender Heroku (POST /chat).",
    },
    {
      id: "supabase",
      ok: supabase,
      severity: isProd ? "blocker" : "warning",
      message: supabase
        ? "Supabase env configured."
        : "Supabase not configured — production should use real auth (demo blocked unless ALLOW_DEMO_AUTH).",
    },
    {
      id: "demo_auth",
      ok: !(demoAllowed && isProd),
      severity: "blocker",
      message:
        demoAllowed && isProd
          ? "ALLOW_DEMO_AUTH is effective in production — disable before public traffic."
          : demoAllowed
            ? "Demo auth allowed (non-production) — expected for local/dev."
            : "Demo auth disabled or superseded by Supabase.",
    },
    {
      id: "app_url",
      ok: appUrl || !isProd,
      severity: isProd ? "blocker" : "info",
      message: appUrl
        ? "NEXT_PUBLIC_APP_URL is set (Paybis return URLs)."
        : "NEXT_PUBLIC_APP_URL missing — set to https://www.dimeindustries.us in production.",
    },
    {
      id: "paybis_webhook",
      ok: !paybisKeys || paybisWebhook || !isProd,
      severity: "blocker",
      message:
        paybisKeys && !paybisWebhook && isProd
          ? "Live Paybis keys without PAYBIS_WEBHOOK_SECRET — webhook route will 503."
          : paybisKeys
            ? "Paybis keys present; webhook secret configured or non-prod."
            : "Paybis keys absent — mock checkout path active.",
    },
    {
      id: "resend",
      ok: resend || !isProd,
      severity: "warning",
      message: resend
        ? "Resend configured for transactional email (orders, forms, admin alerts)."
        : "RESEND_API_KEY unset — transactional emails dry-run only.",
    },
    {
      id: "sentry",
      ok: sentry || !isProd,
      severity: "warning",
      message: sentry
        ? "Sentry DSN configured."
        : "NEXT_PUBLIC_SENTRY_DSN unset — errors will not report remotely.",
    },
    {
      id: "paybis_webhook_persist",
      ok: ordersDb,
      severity: ordersDb ? "info" : "warning",
      message: ordersDb
        ? "Paybis webhooks can mark commerce_orders paid by paymentRequestId."
        : "Paybis webhooks verify signatures but cannot mutate cookie jars — enable DB orders.",
    },
  ];

  const blockers = checks.filter((c) => c.severity === "blocker" && !c.ok);
  const readyForPublicTraffic = blockers.length === 0;
  const softLaunch = !ordersDb;

  return {
    checkedAt: new Date().toISOString(),
    environment,
    softLaunch,
    readyForPublicTraffic,
    checks,
  };
}
