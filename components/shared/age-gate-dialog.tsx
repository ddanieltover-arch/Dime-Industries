// components/shared/age-gate-dialog.tsx
"use client";

import { AGE_GATE_ENTRY_ENABLED } from "@/lib/compliance/age-gate-flags";

/**
 * Age-gate entry dialog — no-op while `AGE_GATE_ENTRY_ENABLED` is false
 * (owner 2026-08-07). Call sites may keep the import for a quick restore;
 * re-implement dialog UI from git history when flipping the flag.
 */
export function AgeGateDialog(_props: { initiallyOpen: boolean }) {
  if (!AGE_GATE_ENTRY_ENABLED) return null;
  return null;
}
