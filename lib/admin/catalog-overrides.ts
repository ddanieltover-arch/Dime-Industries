// lib/admin/catalog-overrides.ts
// Admin edits layered over the catalog (Postgres when seeded, else seed file).

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { z } from "zod";
import { loadCatalogFromDatabase } from "@/lib/catalog/catalog-db";
import { SEED_CATALOG } from "@/lib/catalog/seed-catalog";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog/types";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import { withTimeout } from "@/lib/async/with-timeout";
import * as overridesDb from "./catalog-overrides-db";
import { hasProductOverride, type CatalogOverrides, type ProductOverride } from "./catalog-override-logic";

export const ADMIN_CATALOG_COOKIE = "dime_admin_catalog";

export type { ProductOverride, CatalogOverrides };
export { hasProductOverride };

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
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return {};
  }
  if (isGrowthDatabaseMode()) {
    try {
      return await withTimeout(overridesDb.dbReadCatalogOverrides(), 2_000, "catalog-overrides");
    } catch (err) {
      console.error("[catalog-overrides] db read failed, using empty overrides", err);
      return {};
    }
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

export async function getCatalogOverrides(): Promise<CatalogOverrides> {
  return readOverrides();
}

export const getAdminCatalog = cache(async (): Promise<CatalogProduct[]> => {
  const [overrides, fromDb, categoryOverrides] = await Promise.all([
    readOverrides(),
    loadCatalogFromDatabase(),
    import("@/lib/admin/categories-store").then((m) => m.getCategoryOverrides()),
  ]);
  const { applyCategoryNameOverrides } = await import("@/lib/admin/categories-store");
  const base = fromDb ?? SEED_CATALOG;
  const withProductOverrides = base.map((product) => {
    const o = overrides[product.id];
    if (!o) return product;
    return {
      ...product,
      name: o.name ?? product.name,
      status: o.status ?? product.status,
      variants: product.variants.map((v) => applyVariant(v, o.variants?.[v.id])),
    };
  });
  return applyCategoryNameOverrides(withProductOverrides, categoryOverrides);
});

export async function getAdminProduct(productId: string): Promise<CatalogProduct | null> {
  const all = await getAdminCatalog();
  return all.find((p) => p.id === productId) ?? null;
}

/** Overrides only — never create catalog rows. Unknown ids are rejected by callers. */
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

export async function clearProductOverride(productId: string): Promise<boolean> {
  const current = await readOverrides();
  if (!(productId in current)) return false;
  delete current[productId];
  await writeOverrides(current);
  return true;
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
