// lib/compliance/age-gate.ts
// Server-only. The age gate is a real legal control (SRS §7), so the source
// of truth is a server-readable cookie checked on every render — the client
// dialog is the UX, this is the enforcement half. Checkout re-validates
// independently against the account's stored jurisdiction (Database
// Architecture §4.4); this cookie only governs what a guest can *see*.
//
// Minimum age (`SITE_MIN_AGE`) is code-defined — not admin-configurable.

import "server-only";
import { cookies } from "next/headers";
import {
  isLaunchJurisdiction,
  type LaunchJurisdiction,
} from "@/lib/compliance/jurisdictions";

export {
  LAUNCH_JURISDICTIONS,
  SITE_MIN_AGE,
  isLaunchJurisdiction,
  type LaunchJurisdiction,
} from "@/lib/compliance/jurisdictions";

export type AgeGateState = {
  ageVerified: boolean;
  jurisdiction: LaunchJurisdiction | null;
};

export async function getAgeGateState(): Promise<AgeGateState> {
  const store = await cookies();
  const ageVerified = store.get("dime_age_verified")?.value === "1";
  const jurisdictionRaw = store.get("dime_jurisdiction")?.value ?? "";
  const jurisdiction = isLaunchJurisdiction(jurisdictionRaw) ? jurisdictionRaw : null;
  return { ageVerified, jurisdiction };
}
