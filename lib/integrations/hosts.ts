// lib/integrations/hosts.ts
/**
 * Public DIME reference hosts discovered on dimeindustries.com.
 * Env vars always win; these defaults enable live mode without secrets
 * because the Heroku COA + Budtender apps expose public HTTP APIs.
 */

export const DIME_REFERENCE_HOSTS = {
  /** Lab Results / COA search UI + `/api/coas` */
  coa: "https://coas-7d1e18b1a038.herokuapp.com",
  /** HeyGen Budtender chat — `POST /chat` → `{ reply }` */
  assistant: "https://budtender-bdf452c7c488.herokuapp.com",
  /** Rewards SPA (OAuth) — no public REST matching our adapter contract */
  rewardsApp: "https://rewards.dimeindustries.com",
  /** Package serial validator (Firebase) */
  validateApp: "https://dime-serial-validator-cd1cd.firebaseapp.com",
} as const;

export function resolveCoaApiBase(): string | null {
  const fromEnv = process.env.COA_API_BASE?.trim();
  if (fromEnv === "off" || fromEnv === "mock") return null;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return DIME_REFERENCE_HOSTS.coa;
}

export function resolveAssistantApiBase(): string | null {
  const fromEnv = process.env.ASSISTANT_API_BASE?.trim();
  if (fromEnv === "off" || fromEnv === "mock") return null;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return DIME_REFERENCE_HOSTS.assistant;
}

export function resolveRewardsApiBase(): string | null {
  const fromEnv = process.env.REWARDS_API_BASE?.trim();
  if (fromEnv === "off" || fromEnv === "mock") return null;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // No public REST API on rewards.dimeindustries.com — stay local until key+contract host set.
  return null;
}
