// lib/affiliate/payouts.ts
import "server-only";
import { cookies } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { commerceAffiliatePayouts } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import { getOrCreateAffiliate, listAffiliateAccounts, type AffiliateAccount } from "./store";

import type { AffiliatePayout, PayoutStatus } from "./payout-types";
import { MIN_PAYOUT_CENTS } from "./payout-types";

export type { AffiliatePayout, PayoutStatus };
export { MIN_PAYOUT_CENTS };

export const AFFILIATE_PAYOUTS_COOKIE = "dime_affiliate_payouts";

const payoutSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  amountCents: z.number().int().positive(),
  status: z.enum(["pending", "paid", "rejected"]),
  note: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  paidAt: z.string().nullable(),
});

const jarSchema = z.object({ payouts: z.array(payoutSchema).max(200) });

async function readCookiePayouts(): Promise<AffiliatePayout[]> {
  const store = await cookies();
  const raw = store.get(AFFILIATE_PAYOUTS_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.payouts : [];
  } catch {
    return [];
  }
}

async function writeCookiePayouts(payouts: AffiliatePayout[]): Promise<void> {
  const store = await cookies();
  store.set(
    AFFILIATE_PAYOUTS_COOKIE,
    encodeURIComponent(JSON.stringify({ payouts: payouts.slice(0, 200) })),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    }
  );
}

function rowToPayout(row: typeof commerceAffiliatePayouts.$inferSelect): AffiliatePayout {
  return {
    id: row.id,
    email: row.email,
    amountCents: row.amountCents,
    status: row.status as PayoutStatus,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
  };
}

export async function listPayouts(email?: string): Promise<AffiliatePayout[]> {
  if (isGrowthDatabaseMode()) {
    const db = getDb();
    const rows = email
      ? await db
          .select()
          .from(commerceAffiliatePayouts)
          .where(eq(commerceAffiliatePayouts.email, email.toLowerCase()))
          .orderBy(desc(commerceAffiliatePayouts.createdAt))
      : await db
          .select()
          .from(commerceAffiliatePayouts)
          .orderBy(desc(commerceAffiliatePayouts.createdAt))
          .limit(100);
    return rows.map(rowToPayout);
  }
  const all = await readCookiePayouts();
  return email
    ? all.filter((p) => p.email === email.toLowerCase())
    : all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function availablePayoutCents(
  account: AffiliateAccount,
  payouts: AffiliatePayout[]
): number {
  const reserved = payouts
    .filter((p) => p.email === account.email && (p.status === "pending" || p.status === "paid"))
    .reduce((s, p) => s + p.amountCents, 0);
  return Math.max(0, account.earnedCents - reserved);
}

export async function requestAffiliatePayout(
  email: string,
  amountCents: number
): Promise<{ ok: true; payout: AffiliatePayout } | { ok: false; error: string }> {
  const account = await getOrCreateAffiliate(email);
  const existing = await listPayouts(account.email);
  const available = availablePayoutCents(account, existing);
  const amount = Math.floor(amountCents);
  if (amount < MIN_PAYOUT_CENTS) {
    return { ok: false, error: `Minimum payout is $${(MIN_PAYOUT_CENTS / 100).toFixed(0)}.` };
  }
  if (amount > available) {
    return { ok: false, error: "Amount exceeds available balance." };
  }
  if (existing.some((p) => p.status === "pending" && p.email === account.email)) {
    return { ok: false, error: "A payout request is already pending." };
  }

  const now = new Date().toISOString();
  const payout: AffiliatePayout = {
    id: `po_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    email: account.email,
    amountCents: amount,
    status: "pending",
    note: null,
    createdAt: now,
    updatedAt: now,
    paidAt: null,
  };

  if (isGrowthDatabaseMode()) {
    const db = getDb();
    await db.insert(commerceAffiliatePayouts).values({
      id: payout.id,
      email: payout.email,
      amountCents: payout.amountCents,
      status: payout.status,
      note: null,
      createdAt: new Date(payout.createdAt),
      updatedAt: new Date(payout.updatedAt),
      paidAt: null,
    });
  } else {
    const all = await readCookiePayouts();
    await writeCookiePayouts([payout, ...all]);
  }
  return { ok: true, payout };
}

export async function reviewAffiliatePayout(
  payoutId: string,
  status: "paid" | "rejected",
  note?: string
): Promise<AffiliatePayout | null> {
  const now = new Date();
  if (isGrowthDatabaseMode()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(commerceAffiliatePayouts)
      .where(eq(commerceAffiliatePayouts.id, payoutId))
      .limit(1);
    const current = rows[0];
    if (!current || current.status !== "pending") return null;
    await db
      .update(commerceAffiliatePayouts)
      .set({
        status,
        note: note?.trim() || current.note,
        updatedAt: now,
        paidAt: status === "paid" ? now : null,
      })
      .where(eq(commerceAffiliatePayouts.id, payoutId));
    const updated = await db
      .select()
      .from(commerceAffiliatePayouts)
      .where(eq(commerceAffiliatePayouts.id, payoutId))
      .limit(1);
    return updated[0] ? rowToPayout(updated[0]) : null;
  }

  const all = await readCookiePayouts();
  const idx = all.findIndex((p) => p.id === payoutId);
  if (idx < 0 || all[idx]!.status !== "pending") return null;
  const next: AffiliatePayout = {
    ...all[idx]!,
    status,
    note: note?.trim() || all[idx]!.note,
    updatedAt: now.toISOString(),
    paidAt: status === "paid" ? now.toISOString() : null,
  };
  all[idx] = next;
  await writeCookiePayouts(all);
  return next;
}

export async function affiliateFinanceSummary() {
  const [accounts, payouts] = await Promise.all([listAffiliateAccounts(), listPayouts()]);
  const pendingCents = payouts
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amountCents, 0);
  const paidCents = payouts
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amountCents, 0);
  return { accounts, payouts, pendingCents, paidCents };
}
