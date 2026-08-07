// lib/compliance/age-gate.ts
// Server-only. Age verification cookie was the legal control (SRS §7).
//
// Owner request 2026-08-07: entry popup disabled (`AGE_GATE_ENTRY_ENABLED = false`)
// so browse paths always treat the visitor as verified. Jurisdiction cookie still
// scopes catalog when set. Checkout re-validates independently against the
// account's stored jurisdiction (Database Architecture §4.4).
//
// To restore the gate: set `AGE_GATE_ENTRY_ENABLED` to true and re-enable
// `AgeGateDialog` call sites / SEO teaser branches.
//
// Minimum age (`SITE_MIN_AGE`) remains code-defined — not admin-configurable.

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import {
  isLaunchJurisdiction,
  type LaunchJurisdiction,
} from "@/lib/compliance/jurisdictions";
import { AGE_GATE_ENTRY_ENABLED } from "@/lib/compliance/age-gate-flags";
import { isActiveLaunchJurisdiction } from "@/lib/admin/site-settings-store";

export {
  LAUNCH_JURISDICTIONS,
  SITE_MIN_AGE,
  isLaunchJurisdiction,
  type LaunchJurisdiction,
} from "@/lib/compliance/jurisdictions";

export { AGE_GATE_ENTRY_ENABLED } from "@/lib/compliance/age-gate-flags";

export type AgeGateState = {
  ageVerified: boolean;
  jurisdiction: LaunchJurisdiction | null;
};

async function readAgeGateState(): Promise<AgeGateState> {
  const store = await cookies();
  const ageVerified = AGE_GATE_ENTRY_ENABLED
    ? store.get("dime_age_verified")?.value === "1"
    : true;

  const jurisdictionRaw = store.get("dime_jurisdiction")?.value ?? "";

  // No cookie → no settings/DB read. Fast path for most anonymous browse.
  if (!isLaunchJurisdiction(jurisdictionRaw)) {
    return { ageVerified, jurisdiction: null };
  }

  // Drop jurisdictions admins have deactivated (cached per request + process TTL).
  const active = await isActiveLaunchJurisdiction(jurisdictionRaw);
  return {
    ageVerified,
    jurisdiction: active ? jurisdictionRaw : null,
  };
}

/** Per-request dedupe — shop/PDP/actions often call this more than once. */
export const getAgeGateState = cache(readAgeGateState);

/** Catalog jurisdiction only — shares `getAgeGateState` cache. */
export async function getCatalogJurisdiction(): Promise<LaunchJurisdiction | null> {
  return (await getAgeGateState()).jurisdiction;
}
