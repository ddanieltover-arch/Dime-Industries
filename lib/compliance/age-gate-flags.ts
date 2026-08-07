// lib/compliance/age-gate-flags.ts
// Shared client/server flag — keep free of `server-only` imports.

/**
 * Entry dialog + unverified browse blocks.
 * `false` = open browse (owner 2026-08-07). Flip to restore gate UX.
 */
export const AGE_GATE_ENTRY_ENABLED = false;
