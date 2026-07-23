// lib/integrations/rewards/client.ts
import "server-only";
import type { RewardsEvent, RewardsMember } from "./types";

function rewardsConfigured() {
  return Boolean(process.env.REWARDS_API_BASE?.trim());
}

function syncEnabled() {
  return process.env.REWARDS_SYNC_ENABLED === "true" && rewardsConfigured();
}

function allowlistedUrl(path: string): URL | null {
  const base = process.env.REWARDS_API_BASE?.trim();
  if (!base) return null;
  try {
    const origin = new URL(base);
    const url = new URL(path, origin);
    if (url.origin !== origin.origin) return null;
    return url;
  } catch {
    return null;
  }
}

function authHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const key = process.env.REWARDS_API_KEY?.trim();
  if (key) headers.Authorization = `Bearer ${key}`;
  return headers;
}

export async function fetchRewardsMember(email: string): Promise<RewardsMember> {
  const normalized = email.toLowerCase();
  const url = allowlistedUrl(`/v1/members/${encodeURIComponent(normalized)}`);
  if (!url) {
    return {
      email: normalized,
      externalId: null,
      pointsBalance: 0,
      tier: null,
      source: "mock",
    };
  }

  try {
    const res = await fetch(url, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        email: normalized,
        externalId: null,
        pointsBalance: 0,
        tier: null,
        source: "mock",
      };
    }
    const data = (await res.json()) as Partial<RewardsMember>;
    return {
      email: data.email ?? normalized,
      externalId: data.externalId ?? null,
      pointsBalance: Number(data.pointsBalance ?? 0),
      tier: data.tier ?? null,
      source: "live",
    };
  } catch (err) {
    console.warn("[rewards] member fetch failed", err);
    return {
      email: normalized,
      externalId: null,
      pointsBalance: 0,
      tier: null,
      source: "mock",
    };
  }
}

/** Fire-and-forget sync; never throws to callers. */
export async function pushRewardsEvent(event: RewardsEvent): Promise<boolean> {
  if (!syncEnabled()) return false;
  const url = allowlistedUrl("/v1/events");
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch (err) {
    console.warn("[rewards] event push failed", event.idempotencyKey, err);
    return false;
  }
}

export function getRewardsIntegrationStatus() {
  return {
    configured: rewardsConfigured(),
    syncEnabled: syncEnabled(),
    mode: rewardsConfigured() ? ("live" as const) : ("mock" as const),
  };
}
