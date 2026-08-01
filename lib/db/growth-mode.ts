// lib/db/growth-mode.ts
import "server-only";
import { isOrdersDatabaseMode } from "@/lib/checkout/repository";

/**
 * Cart/wishlist/CMS/coupons/loyalty/affiliate/catalog overrides/inventory/wholesale/returns
 * share the same DATABASE_URL auto-gate as orders
 * (ORDERS_PERSISTENCE=auto|database|cookie).
 */
export function isGrowthDatabaseMode(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
) {
  return isOrdersDatabaseMode(env);
}
