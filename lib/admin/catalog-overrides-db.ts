// lib/admin/catalog-overrides-db.ts
import "server-only";
import { eq } from "drizzle-orm";
import { commerceCatalogOverrides } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import type { CatalogOverrides, ProductOverride } from "./catalog-overrides";

export async function dbReadCatalogOverrides(): Promise<CatalogOverrides> {
  const db = getDb();
  const rows = await db.select().from(commerceCatalogOverrides);
  const out: CatalogOverrides = {};
  for (const row of rows) {
    out[row.productId] = row.override as ProductOverride;
  }
  return out;
}

export async function dbWriteCatalogOverrides(products: CatalogOverrides): Promise<void> {
  const db = getDb();
  const ids = Object.keys(products);
  // Replace-all strategy for the jar shape: upsert each, delete removed.
  const existing = await db.select({ productId: commerceCatalogOverrides.productId }).from(
    commerceCatalogOverrides
  );
  const existingIds = new Set(existing.map((r) => r.productId));

  for (const productId of ids) {
    const override = products[productId] ?? {};
    await db
      .insert(commerceCatalogOverrides)
      .values({ productId, override, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: commerceCatalogOverrides.productId,
        set: { override, updatedAt: new Date() },
      });
  }

  for (const productId of existingIds) {
    if (!ids.includes(productId)) {
      await db
        .delete(commerceCatalogOverrides)
        .where(eq(commerceCatalogOverrides.productId, productId));
    }
  }
}
