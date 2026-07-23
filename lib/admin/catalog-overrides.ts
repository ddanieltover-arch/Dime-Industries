// lib/admin/catalog-overrides.ts
// Admin edits layered over the seed catalog until products table is the source of truth.

import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { SEED_CATALOG } from "@/lib/catalog/seed-catalog";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog/types";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import * as overridesDb from "./catalog-overrides-db";

export const ADMIN_CATALOG_COOKIE = "dime_admin_catalog";

const variantOverrideSchema = z.object({
  retailPriceCents: z.number().int().nonnegative().optional(),
  quantityOnHand: z.number().int().nonnegative().optional(),
});

const productOverrideSchema = z.object({
  status: z.enum(["draft", "active", "archived"]).optional(),
  name: z.string().min(1).max(120).optional(),
  variants: z.record(variantOverrideSchema).optional(),
});

const jarSchema = z.object({
  products: z.record(productOverrideSchema),
});

export type ProductOverride = z.infer<typeof productOverrideSchema>;
export type CatalogOverrides = Record<string, ProductOverride>;

async function readOverridesCookie(): Promise<CatalogOverrides> {
  const store = await cookies();
  const raw = store.get(ADMIN_CATALOG_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.products : {};
  } catch {
    return {};
  }
}

async function writeOverridesCookie(products: CatalogOverrides): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_CATALOG_COOKIE, encodeURIComponent(JSON.stringify({ products })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

async function readOverrides(): Promise<CatalogOverrides> {
  if (isGrowthDatabaseMode()) {
    return overridesDb.dbReadCatalogOverrides();
  }
  return readOverridesCookie();
}

async function writeOverrides(products: CatalogOverrides): Promise<void> {
  if (isGrowthDatabaseMode()) {
    await overridesDb.dbWriteCatalogOverrides(products);
    return;
  }
  await writeOverridesCookie(products);
}

function applyVariant(v: CatalogVariant, patch?: z.infer<typeof variantOverrideSchema>): CatalogVariant {
  if (!patch) return v;
  return {
    ...v,
    retailPriceCents: patch.retailPriceCents ?? v.retailPriceCents,
    quantityOnHand: patch.quantityOnHand ?? v.quantityOnHand,
  };
}

export async function getAdminCatalog(): Promise<CatalogProduct[]> {
  const overrides = await readOverrides();
  return SEED_CATALOG.map((product) => {
    const o = overrides[product.id];
    if (!o) return product;
    return {
      ...product,
      name: o.name ?? product.name,
      status: o.status ?? product.status,
      variants: product.variants.map((v) => applyVariant(v, o.variants?.[v.id])),
    };
  });
}

export async function getAdminProduct(productId: string): Promise<CatalogProduct | null> {
  const all = await getAdminCatalog();
  return all.find((p) => p.id === productId) ?? null;
}

export async function patchProductOverride(
  productId: string,
  patch: ProductOverride
): Promise<CatalogOverrides> {
  const current = await readOverrides();
  const existing = current[productId] ?? {};
  current[productId] = {
    ...existing,
    ...patch,
    variants: { ...(existing.variants ?? {}), ...(patch.variants ?? {}) },
  };
  await writeOverrides(current);
  return current;
}

export async function adjustInventory(
  productId: string,
  variantId: string,
  quantityOnHand: number
): Promise<void> {
  await patchProductOverride(productId, {
    variants: { [variantId]: { quantityOnHand } },
  });
  const { syncInventoryQuantity } = await import("@/lib/inventory");
  await syncInventoryQuantity(variantId, quantityOnHand);
}
