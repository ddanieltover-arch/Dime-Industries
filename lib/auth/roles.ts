// lib/auth/roles.ts

export const ROLES = ["guest", "customer", "wholesale", "admin", "vendor"] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

/**
 * Authorization check for route/action gating.
 *
 * `admin` can do anything. Everything else is deliberately NOT a numeric
 * ladder — `customer`, `wholesale`, and `vendor` are lateral roles with
 * distinct catalogs/permissions, not tiers of the same thing. A previous
 * version of this function ranked them all at the same numeric level for
 * an "at least" comparison, which meant `hasAtLeastRole("customer",
 * "wholesale")` incorrectly returned true — any signed-in retail customer
 * would have passed the wholesale-catalog gate. Fixed by making lateral
 * roles require an exact match instead of a >= comparison.
 */
export function hasAtLeastRole(userRole: Role, required: Role): boolean {
  if (userRole === "admin") return true;
  if (required === "admin") return false; // only admin passes an admin gate

  if (required === "customer") {
    // Wholesale and vendor accounts are still customers of the platform in
    // the sense that they can access customer-tier areas (own orders,
    // profile, etc.) — but see requireRole() call sites: use this only for
    // gates that are genuinely fine being satisfied by any authenticated
    // buyer role.
    return userRole === "customer" || userRole === "wholesale" || userRole === "vendor";
  }

  // wholesale / vendor / guest gates: exact match only, no lateral passes.
  return userRole === required;
}
