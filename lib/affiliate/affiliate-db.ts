// lib/affiliate/affiliate-db.ts
import "server-only";
import { desc, eq } from "drizzle-orm";
import { commerceAffiliates } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import type { AffiliateAccount } from "./store";

function rowToAccount(row: typeof commerceAffiliates.$inferSelect): AffiliateAccount {
  return {
    email: row.email,
    referralCode: row.referralCode,
    clicks: row.clicks,
    conversions: row.conversions,
    earnedCents: row.earnedCents,
    commissionBps: row.commissionBps,
  };
}

export async function dbGetAffiliateByEmail(email: string): Promise<AffiliateAccount | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceAffiliates)
    .where(eq(commerceAffiliates.email, email.toLowerCase()))
    .limit(1);
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function dbGetAffiliateByCode(code: string): Promise<AffiliateAccount | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceAffiliates)
    .where(eq(commerceAffiliates.referralCode, code.toUpperCase()))
    .limit(1);
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function dbUpsertAffiliate(account: AffiliateAccount): Promise<void> {
  const db = getDb();
  await db
    .insert(commerceAffiliates)
    .values({
      email: account.email.toLowerCase(),
      referralCode: account.referralCode.toUpperCase(),
      clicks: account.clicks,
      conversions: account.conversions,
      earnedCents: account.earnedCents,
      commissionBps: account.commissionBps,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: commerceAffiliates.email,
      set: {
        referralCode: account.referralCode.toUpperCase(),
        clicks: account.clicks,
        conversions: account.conversions,
        earnedCents: account.earnedCents,
        commissionBps: account.commissionBps,
        updatedAt: new Date(),
      },
    });
}

export async function dbListAffiliates(): Promise<AffiliateAccount[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceAffiliates)
    .orderBy(desc(commerceAffiliates.earnedCents));
  return rows.map(rowToAccount);
}
