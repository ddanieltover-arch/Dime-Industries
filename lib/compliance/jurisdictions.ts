// lib/compliance/jurisdictions.ts
// Shared launch-jurisdiction constants — safe for client and server.
// Cookie enforcement lives in age-gate.ts (server-only).
// Age gate minimum age is code-defined (not admin-configurable).

export const LAUNCH_JURISDICTIONS = ["CA", "MA"] as const;
export type LaunchJurisdiction = (typeof LAUNCH_JURISDICTIONS)[number];

/** Flat 21+ launch gate — change only in code / legal review, not Admin Settings. */
export const SITE_MIN_AGE = 21 as const;

export function isLaunchJurisdiction(v: string): v is LaunchJurisdiction {
  return (LAUNCH_JURISDICTIONS as readonly string[]).includes(v);
}
