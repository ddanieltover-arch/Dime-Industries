// lib/affiliate/store.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import * as affiliateDb from "./affiliate-db";

export const AFFILIATE_COOKIE = "dime_affiliate";
export const AFFILIATE_REF_COOKIE = "dime_ref";

const accountSchema = z.object({
  email: z.string().email(),
  referralCode: z.string(),
  clicks: z.number().int().nonnegative(),
  conversions: z.number().int().nonnegative(),
  earnedCents: z.number().int().nonnegative(),
  commissionBps: z.number().int().nonnegative(), // 1000 = 10%
});

const jarSchema = z.object({
  accounts: z.record(accountSchema),
});

export type AffiliateAccount = z.infer<typeof accountSchema>;

function codeFromEmail(email: string) {
  const base = email.split("@")[0]?.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase() || "DIME";
  return `DIME-${base}`;
}

async function readJar(): Promise<Record<string, AffiliateAccount>> {
  const store = await cookies();
  const raw = store.get(AFFILIATE_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.accounts : {};
  } catch {
    return {};
  }
}

async function writeJar(accounts: Record<string, AffiliateAccount>): Promise<void> {
  const store = await cookies();
  store.set(AFFILIATE_COOKIE, encodeURIComponent(JSON.stringify({ accounts })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

async function setRefCookie(code: string): Promise<void> {
  const store = await cookies();
  store.set(AFFILIATE_REF_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getOrCreateAffiliate(email: string): Promise<AffiliateAccount> {
  const key = email.toLowerCase();
  if (isGrowthDatabaseMode()) {
    const existing = await affiliateDb.dbGetAffiliateByEmail(key);
    if (existing) return existing;
    const account: AffiliateAccount = {
      email: key,
      referralCode: codeFromEmail(key),
      clicks: 0,
      conversions: 0,
      earnedCents: 0,
      commissionBps: 1000,
    };
    await affiliateDb.dbUpsertAffiliate(account);
    return account;
  }

  const accounts = await readJar();
  if (accounts[key]) return accounts[key]!;
  const account: AffiliateAccount = {
    email: key,
    referralCode: codeFromEmail(key),
    clicks: 0,
    conversions: 0,
    earnedCents: 0,
    commissionBps: 1000,
  };
  accounts[key] = account;
  await writeJar(accounts);
  return account;
}

export async function recordAffiliateClick(code: string): Promise<void> {
  const normalized = code.toUpperCase();
  if (isGrowthDatabaseMode()) {
    const hit = await affiliateDb.dbGetAffiliateByCode(normalized);
    if (!hit) return;
    hit.clicks += 1;
    await affiliateDb.dbUpsertAffiliate(hit);
    await setRefCookie(hit.referralCode);
    return;
  }

  const accounts = await readJar();
  const hit = Object.values(accounts).find((a) => a.referralCode === normalized);
  if (!hit) return;
  hit.clicks += 1;
  accounts[hit.email] = hit;
  await writeJar(accounts);
  await setRefCookie(hit.referralCode);
}

export async function getStoredReferralCode(): Promise<string | null> {
  const store = await cookies();
  return store.get(AFFILIATE_REF_COOKIE)?.value ?? null;
}

export async function attributeAffiliateConversion(
  orderTotalCents: number
): Promise<AffiliateAccount | null> {
  const code = await getStoredReferralCode();
  if (!code) return null;

  if (isGrowthDatabaseMode()) {
    const hit = await affiliateDb.dbGetAffiliateByCode(code);
    if (!hit) return null;
    const earned = Math.round((orderTotalCents * hit.commissionBps) / 10000);
    hit.conversions += 1;
    hit.earnedCents += earned;
    await affiliateDb.dbUpsertAffiliate(hit);
    return hit;
  }

  const accounts = await readJar();
  const hit = Object.values(accounts).find((a) => a.referralCode === code);
  if (!hit) return null;
  const earned = Math.round((orderTotalCents * hit.commissionBps) / 10000);
  hit.conversions += 1;
  hit.earnedCents += earned;
  accounts[hit.email] = hit;
  await writeJar(accounts);
  return hit;
}

export async function listAffiliateAccounts(): Promise<AffiliateAccount[]> {
  if (isGrowthDatabaseMode()) {
    return affiliateDb.dbListAffiliates();
  }
  return Object.values(await readJar()).sort((a, b) => b.earnedCents - a.earnedCents);
}
