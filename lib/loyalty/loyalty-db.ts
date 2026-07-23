// lib/loyalty/loyalty-db.ts
import "server-only";
import { desc, eq } from "drizzle-orm";
import { commerceLoyalty } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import type { LoyaltyAccount } from "./store";

function rowToAccount(row: typeof commerceLoyalty.$inferSelect): LoyaltyAccount {
  const history = Array.isArray(row.history) ? row.history : [];
  return {
    email: row.email,
    pointsBalance: row.pointsBalance,
    lifetimeEarned: row.lifetimeEarned,
    tier: row.tier as LoyaltyAccount["tier"],
    history: history as LoyaltyAccount["history"],
  };
}

export async function dbGetLoyalty(email: string): Promise<LoyaltyAccount | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceLoyalty)
    .where(eq(commerceLoyalty.email, email.toLowerCase()))
    .limit(1);
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function dbUpsertLoyalty(account: LoyaltyAccount): Promise<void> {
  const db = getDb();
  const email = account.email.toLowerCase();
  await db
    .insert(commerceLoyalty)
    .values({
      email,
      pointsBalance: account.pointsBalance,
      lifetimeEarned: account.lifetimeEarned,
      tier: account.tier,
      history: account.history,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: commerceLoyalty.email,
      set: {
        pointsBalance: account.pointsBalance,
        lifetimeEarned: account.lifetimeEarned,
        tier: account.tier,
        history: account.history,
        updatedAt: new Date(),
      },
    });
}

export async function dbListLoyalty(): Promise<LoyaltyAccount[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceLoyalty)
    .orderBy(desc(commerceLoyalty.pointsBalance));
  return rows.map(rowToAccount);
}
