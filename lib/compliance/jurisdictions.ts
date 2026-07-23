// lib/compliance/jurisdictions.ts
// Shared launch-jurisdiction constants — safe for client and server.
// Cookie enforcement lives in age-gate.ts (server-only).

export const LAUNCH_JURISDICTIONS = ["CA", "MA"] as const;
export type LaunchJurisdiction = (typeof LAUNCH_JURISDICTIONS)[number];

export function isLaunchJurisdiction(v: string): v is LaunchJurisdiction {
  return (LAUNCH_JURISDICTIONS as readonly string[]).includes(v);
}
