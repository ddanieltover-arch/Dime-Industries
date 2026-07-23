// lib/wholesale/store.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import * as accountsDb from "./accounts-db";
import {
  WHOLESALE_ACCOUNTS_COOKIE,
  WHOLESALE_OVERRIDES_COOKIE,
  type PaymentTerms,
  type WholesaleAccount,
  type WholesaleApplyInput,
  type WholesalePriceOverride,
} from "./types";

const accountSchema = z.object({
  email: z.string().email(),
  businessName: z.string().min(2).max(120),
  licenseNumber: z.string().nullable(),
  resaleCertUrl: z.string().nullable(),
  status: z.enum(["pending", "approved", "rejected"]),
  defaultPaymentTerms: z.enum(["net30", "net60", "upfront"]),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  reviewedAt: z.string().nullable(),
});

const jarSchema = z.object({
  accounts: z.record(accountSchema),
});

const overrideSchema = z.object({
  variantId: z.string(),
  priceCents: z.number().int().nonnegative(),
  minQuantity: z.number().int().positive(),
});

const overrideJarSchema = z.object({
  overrides: z.record(overrideSchema),
});

async function readCookieAccounts(): Promise<Record<string, WholesaleAccount>> {
  const store = await cookies();
  const raw = store.get(WHOLESALE_ACCOUNTS_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.accounts : {};
  } catch {
    return {};
  }
}

async function writeCookieAccounts(accounts: Record<string, WholesaleAccount>): Promise<void> {
  const store = await cookies();
  store.set(WHOLESALE_ACCOUNTS_COOKIE, encodeURIComponent(JSON.stringify({ accounts })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

async function readCookieOverrides(): Promise<Record<string, WholesalePriceOverride>> {
  const store = await cookies();
  const raw = store.get(WHOLESALE_OVERRIDES_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = overrideJarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.overrides : {};
  } catch {
    return {};
  }
}

async function writeCookieOverrides(
  overrides: Record<string, WholesalePriceOverride>
): Promise<void> {
  const store = await cookies();
  store.set(WHOLESALE_OVERRIDES_COOKIE, encodeURIComponent(JSON.stringify({ overrides })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

export async function getWholesaleAccount(email: string): Promise<WholesaleAccount | null> {
  const key = email.toLowerCase();
  if (isGrowthDatabaseMode()) return accountsDb.dbGetAccount(key);
  const accounts = await readCookieAccounts();
  return accounts[key] ?? null;
}

export async function getApprovedWholesaleAccount(
  email: string
): Promise<WholesaleAccount | null> {
  const account = await getWholesaleAccount(email);
  return account?.status === "approved" ? account : null;
}

export async function listWholesaleAccounts(): Promise<WholesaleAccount[]> {
  if (isGrowthDatabaseMode()) return accountsDb.dbListAccounts();
  return Object.values(await readCookieAccounts()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function applyWholesaleAccount(
  input: WholesaleApplyInput
): Promise<{ account: WholesaleAccount; created: boolean }> {
  const email = input.email.toLowerCase();
  const existing = await getWholesaleAccount(email);
  if (existing?.status === "approved") {
    return { account: existing, created: false };
  }
  if (existing?.status === "pending") {
    return { account: existing, created: false };
  }

  const now = new Date().toISOString();
  const account: WholesaleAccount = {
    email,
    businessName: input.businessName.trim(),
    licenseNumber: input.licenseNumber?.trim() || null,
    resaleCertUrl: input.resaleCertUrl?.trim() || null,
    status: "pending",
    defaultPaymentTerms: input.preferredTerms ?? "net30",
    notes: null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    reviewedAt: null,
  };

  if (isGrowthDatabaseMode()) {
    await accountsDb.dbUpsertAccount(account);
  } else {
    const accounts = await readCookieAccounts();
    accounts[email] = account;
    await writeCookieAccounts(accounts);
  }
  return { account, created: true };
}

export async function reviewWholesaleAccount(
  email: string,
  status: "approved" | "rejected",
  options?: { defaultPaymentTerms?: PaymentTerms; notes?: string }
): Promise<WholesaleAccount | null> {
  const current = await getWholesaleAccount(email);
  if (!current) return null;
  const now = new Date().toISOString();
  const next: WholesaleAccount = {
    ...current,
    status,
    defaultPaymentTerms: options?.defaultPaymentTerms ?? current.defaultPaymentTerms,
    notes: options?.notes?.trim() || current.notes,
    updatedAt: now,
    reviewedAt: now,
  };
  if (isGrowthDatabaseMode()) {
    await accountsDb.dbUpsertAccount(next);
  } else {
    const accounts = await readCookieAccounts();
    accounts[next.email] = next;
    await writeCookieAccounts(accounts);
  }
  return next;
}

export async function getWholesaleOverrides(): Promise<Record<string, WholesalePriceOverride>> {
  if (isGrowthDatabaseMode()) return accountsDb.dbReadOverrides();
  return readCookieOverrides();
}

export async function setWholesaleOverride(override: WholesalePriceOverride): Promise<void> {
  if (isGrowthDatabaseMode()) {
    await accountsDb.dbUpsertOverride(override);
    return;
  }
  const overrides = await readCookieOverrides();
  overrides[override.variantId] = override;
  await writeCookieOverrides(overrides);
}
