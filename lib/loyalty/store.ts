// lib/loyalty/store.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import * as loyaltyDb from "./loyalty-db";
import { POINTS_PER_DOLLAR, REDEEM_POINTS_PER_DOLLAR } from "./constants";

export const LOYALTY_COOKIE = "dime_loyalty";
export { POINTS_PER_DOLLAR, REDEEM_POINTS_PER_DOLLAR };

const accountSchema = z.object({
  email: z.string().email(),
  pointsBalance: z.number().int().nonnegative(),
  lifetimeEarned: z.number().int().nonnegative(),
  tier: z.enum(["standard", "reserve", "connoisseur"]),
  history: z
    .array(
      z.object({
        id: z.string(),
        at: z.string(),
        delta: z.number().int(),
        reason: z.string(),
      })
    )
    .max(40),
});

const jarSchema = z.object({
  accounts: z.record(accountSchema),
});

export type LoyaltyAccount = z.infer<typeof accountSchema>;

function emptyAccount(email: string): LoyaltyAccount {
  return {
    email: email.toLowerCase(),
    pointsBalance: 0,
    lifetimeEarned: 0,
    tier: "standard",
    history: [],
  };
}

function tierFor(lifetime: number): LoyaltyAccount["tier"] {
  if (lifetime >= 2500) return "connoisseur";
  if (lifetime >= 500) return "reserve";
  return "standard";
}

async function readJar(): Promise<Record<string, LoyaltyAccount>> {
  const store = await cookies();
  const raw = store.get(LOYALTY_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.accounts : {};
  } catch {
    return {};
  }
}

async function writeJar(accounts: Record<string, LoyaltyAccount>): Promise<void> {
  const store = await cookies();
  store.set(LOYALTY_COOKIE, encodeURIComponent(JSON.stringify({ accounts })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

export async function getLoyaltyAccount(email: string): Promise<LoyaltyAccount> {
  const key = email.toLowerCase();
  if (isGrowthDatabaseMode()) {
    return (await loyaltyDb.dbGetLoyalty(key)) ?? emptyAccount(key);
  }
  const accounts = await readJar();
  return accounts[key] ?? emptyAccount(key);
}

async function saveAccount(account: LoyaltyAccount): Promise<void> {
  if (isGrowthDatabaseMode()) {
    await loyaltyDb.dbUpsertLoyalty(account);
    return;
  }
  const accounts = await readJar();
  accounts[account.email.toLowerCase()] = account;
  await writeJar(accounts);
}

export async function earnLoyaltyPoints(
  email: string,
  orderTotalCents: number,
  orderId: string
): Promise<LoyaltyAccount> {
  const points = Math.floor(orderTotalCents / 100) * POINTS_PER_DOLLAR;
  if (points <= 0) return getLoyaltyAccount(email);

  const key = email.toLowerCase();
  const current = await getLoyaltyAccount(key);
  const lifetimeEarned = current.lifetimeEarned + points;
  const next: LoyaltyAccount = {
    ...current,
    pointsBalance: current.pointsBalance + points,
    lifetimeEarned,
    tier: tierFor(lifetimeEarned),
    history: [
      {
        id: `ly_${crypto.randomUUID().slice(0, 8)}`,
        at: new Date().toISOString(),
        delta: points,
        reason: `Earned on order ${orderId}`,
      },
      ...current.history,
    ].slice(0, 40),
  };
  await saveAccount(next);
  try {
    const { pushRewardsEvent } = await import("@/lib/integrations/rewards/client");
    await pushRewardsEvent({
      email: key,
      type: "earn",
      points,
      reason: `Earned on order ${orderId}`,
      idempotencyKey: `${orderId}:earn`,
    });
  } catch {
    /* optional sync */
  }
  return next;
}

export async function adjustLoyaltyPoints(
  email: string,
  delta: number,
  reason: string
): Promise<LoyaltyAccount> {
  const key = email.toLowerCase();
  const current = await getLoyaltyAccount(key);
  const pointsBalance = Math.max(0, current.pointsBalance + delta);
  const lifetimeEarned =
    delta > 0 ? current.lifetimeEarned + delta : current.lifetimeEarned;
  const next: LoyaltyAccount = {
    ...current,
    pointsBalance,
    lifetimeEarned,
    tier: tierFor(lifetimeEarned),
    history: [
      {
        id: `ly_${crypto.randomUUID().slice(0, 8)}`,
        at: new Date().toISOString(),
        delta,
        reason,
      },
      ...current.history,
    ].slice(0, 40),
  };
  await saveAccount(next);
  if (delta !== 0) {
    try {
      const { pushRewardsEvent } = await import("@/lib/integrations/rewards/client");
      await pushRewardsEvent({
        email: key,
        type: delta < 0 ? "redeem" : "adjust",
        points: Math.abs(delta),
        reason,
        idempotencyKey: `adj_${key}_${Date.now()}_${delta}`,
      });
    } catch {
      /* optional sync */
    }
  }
  return next;
}

export async function listLoyaltyAccounts(): Promise<LoyaltyAccount[]> {
  if (isGrowthDatabaseMode()) {
    return loyaltyDb.dbListLoyalty();
  }
  return Object.values(await readJar()).sort((a, b) => b.pointsBalance - a.pointsBalance);
}
