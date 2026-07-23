// lib/wholesale/accounts-db.ts
import "server-only";
import { desc, eq } from "drizzle-orm";
import { commerceWholesaleAccounts, commerceWholesalePriceOverrides } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import type { WholesaleAccount, WholesalePriceOverride } from "./types";

function rowToAccount(row: typeof commerceWholesaleAccounts.$inferSelect): WholesaleAccount {
  return {
    email: row.email,
    businessName: row.businessName,
    licenseNumber: row.licenseNumber,
    resaleCertUrl: row.resaleCertUrl,
    status: row.status as WholesaleAccount["status"],
    defaultPaymentTerms: row.defaultPaymentTerms as WholesaleAccount["defaultPaymentTerms"],
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
  };
}

export async function dbGetAccount(email: string): Promise<WholesaleAccount | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceWholesaleAccounts)
    .where(eq(commerceWholesaleAccounts.email, email.toLowerCase()))
    .limit(1);
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function dbUpsertAccount(account: WholesaleAccount): Promise<void> {
  const db = getDb();
  await db
    .insert(commerceWholesaleAccounts)
    .values({
      email: account.email.toLowerCase(),
      businessName: account.businessName,
      licenseNumber: account.licenseNumber,
      resaleCertUrl: account.resaleCertUrl,
      status: account.status,
      defaultPaymentTerms: account.defaultPaymentTerms,
      notes: account.notes,
      createdAt: new Date(account.createdAt),
      updatedAt: new Date(account.updatedAt),
      reviewedAt: account.reviewedAt ? new Date(account.reviewedAt) : null,
    })
    .onConflictDoUpdate({
      target: commerceWholesaleAccounts.email,
      set: {
        businessName: account.businessName,
        licenseNumber: account.licenseNumber,
        resaleCertUrl: account.resaleCertUrl,
        status: account.status,
        defaultPaymentTerms: account.defaultPaymentTerms,
        notes: account.notes,
        updatedAt: new Date(account.updatedAt),
        reviewedAt: account.reviewedAt ? new Date(account.reviewedAt) : null,
      },
    });
}

export async function dbListAccounts(): Promise<WholesaleAccount[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceWholesaleAccounts)
    .orderBy(desc(commerceWholesaleAccounts.createdAt));
  return rows.map(rowToAccount);
}

export async function dbReadOverrides(): Promise<Record<string, WholesalePriceOverride>> {
  const db = getDb();
  const rows = await db.select().from(commerceWholesalePriceOverrides);
  const out: Record<string, WholesalePriceOverride> = {};
  for (const row of rows) {
    out[row.variantId] = {
      variantId: row.variantId,
      priceCents: row.priceCents,
      minQuantity: row.minQuantity,
    };
  }
  return out;
}

export async function dbUpsertOverride(override: WholesalePriceOverride): Promise<void> {
  const db = getDb();
  await db
    .insert(commerceWholesalePriceOverrides)
    .values({
      variantId: override.variantId,
      priceCents: override.priceCents,
      minQuantity: override.minQuantity,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: commerceWholesalePriceOverrides.variantId,
      set: {
        priceCents: override.priceCents,
        minQuantity: override.minQuantity,
        updatedAt: new Date(),
      },
    });
}
