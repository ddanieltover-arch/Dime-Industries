// app/(commerce)/recent-actions.ts
"use server";

import { getAgeGateState } from "@/lib/compliance/age-gate";
import { recordProductView } from "@/lib/recently-viewed/cookie";

export async function trackProductView(slug: string): Promise<void> {
  const gate = await getAgeGateState();
  if (!gate.ageVerified) return;
  await recordProductView(slug, gate.jurisdiction);
}
