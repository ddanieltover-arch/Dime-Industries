// lib/catalog/catalog-db.ts
// Load CatalogProduct[] from Postgres. Seed catalog still supplies stable cart
// IDs, effects, popularity, and brandPath until those columns are migrated.
// Image URLs come from products.image_url / gallery_urls (Supabase Storage).

import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import {
  categories,
  coaRecords,
  inventory,
  productLines,
  productPotency,
  products,
  productVariants,
} from "@/db/schema";
import { getDb, isDatabaseUrlConfigured } from "@/lib/db/client";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import { SEED_CATALOG } from "./seed-catalog";
import type { CatalogProduct, CatalogVariant, StrainType } from "./types";

function asStrain(value: string | null): StrainType {
  if (value === "sativa" || value === "indica" || value === "hybrid" || value === "na") {
    return value;
  }
  return "hybrid";
}

function asStatus(value: string): CatalogProduct["status"] {
  if (value === "draft" || value === "active" || value === "archived") return value;
  return "draft";
}

function inventoryQty(
  rows: { jurisdiction: string; quantityOnHand: number }[]
): number {
  if (rows.length === 0) return 0;
  const ca = rows.find((r) => r.jurisdiction === "CA");
  if (ca) return ca.quantityOnHand;
  return rows[0]!.quantityOnHand;
}

function num(value: string | null | undefined, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function queryCatalogFromDatabase(): Promise<CatalogProduct[] | null> {
  try {
    const db = getDb();

    const productRows = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        description: products.description,
        strainType: products.strainType,
        status: products.status,
        allowedJurisdictions: products.allowedJurisdictions,
        createdAt: products.createdAt,
        imageUrl: products.imageUrl,
        galleryUrls: products.galleryUrls,
        categorySlug: categories.slug,
        categoryName: categories.name,
        lineSlug: productLines.slug,
        lineName: productLines.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productLines, eq(products.lineId, productLines.id));

    if (productRows.length === 0) return null;

    const variantRows = await db
      .select({
        id: productVariants.id,
        productId: productVariants.productId,
        sku: productVariants.sku,
        weightOrFormat: productVariants.weightOrFormat,
        retailPriceCents: productVariants.retailPriceCents,
        thcPct: productPotency.thcPct,
        cbdPct: productPotency.cbdPct,
        cbnPct: productPotency.cbnPct,
      })
      .from(productVariants)
      .leftJoin(productPotency, eq(productPotency.variantId, productVariants.id));

    const inventoryRows = await db.select().from(inventory);
    const coaRows = await db.select().from(coaRecords);

    const seedBySlug = new Map(SEED_CATALOG.map((p) => [p.slug, p]));
    const seedVariantBySku = new Map<string, { product: CatalogProduct; variant: CatalogVariant }>();
    for (const p of SEED_CATALOG) {
      for (const v of p.variants) {
        seedVariantBySku.set(v.sku.toUpperCase(), { product: p, variant: v });
      }
    }

    const variantsByProduct = new Map<string, typeof variantRows>();
    for (const v of variantRows) {
      const list = variantsByProduct.get(v.productId) ?? [];
      list.push(v);
      variantsByProduct.set(v.productId, list);
    }

    const inventoryByVariant = new Map<string, { jurisdiction: string; quantityOnHand: number }[]>();
    for (const row of inventoryRows) {
      const list = inventoryByVariant.get(row.variantId) ?? [];
      list.push({
        jurisdiction: row.jurisdiction,
        quantityOnHand: row.quantityOnHand,
      });
      inventoryByVariant.set(row.variantId, list);
    }

    const coaByProduct = new Map<string, string>();
    for (const row of coaRows) {
      if (!coaByProduct.has(row.productId)) {
        coaByProduct.set(row.productId, row.externalCoaUrl);
      }
    }

    const catalog: CatalogProduct[] = [];

    for (const row of productRows) {
      const seed = seedBySlug.get(row.slug);
      const dbVariants = variantsByProduct.get(row.id) ?? [];
      if (dbVariants.length === 0) continue;

      const mappedVariants: CatalogVariant[] = dbVariants.map((v) => {
        const seedHit = seedVariantBySku.get(v.sku.toUpperCase());
        const qty = inventoryQty(inventoryByVariant.get(v.id) ?? []);
        return {
          id: seedHit?.variant.id ?? v.id,
          sku: v.sku,
          weightOrFormat: v.weightOrFormat,
          retailPriceCents: v.retailPriceCents,
          thcPct: num(v.thcPct, seedHit?.variant.thcPct ?? 0),
          cbdPct: num(v.cbdPct, seedHit?.variant.cbdPct ?? 0),
          cbnPct: v.cbnPct == null ? (seedHit?.variant.cbnPct ?? null) : num(v.cbnPct),
          quantityOnHand: qty || seedHit?.variant.quantityOnHand || 0,
        };
      });

      catalog.push({
        id: seed?.id ?? row.id,
        slug: row.slug,
        name: row.name,
        description: row.description ?? seed?.description ?? "",
        categorySlug: row.categorySlug,
        categoryName: row.categoryName,
        lineSlug: row.lineSlug ?? null,
        lineName: row.lineName ?? null,
        strainType: asStrain(row.strainType),
        status: asStatus(row.status),
        allowedJurisdictions: row.allowedJurisdictions ?? [],
        effects: seed?.effects ?? [],
        coaUrl: coaByProduct.get(row.id) ?? seed?.coaUrl ?? null,
        createdAt: (row.createdAt ?? new Date()).toISOString(),
        variants: mappedVariants,
        popularityScore: seed?.popularityScore ?? 50,
        imageUrl: row.imageUrl || seed?.imageUrl || null,
        galleryUrls:
          row.galleryUrls && row.galleryUrls.length > 0
            ? row.galleryUrls
            : (seed?.galleryUrls ?? []),
        brandPath: seed?.brandPath ?? null,
      });
    }

    return catalog.length > 0 ? catalog : null;
  } catch (err) {
    console.error("[catalog-db] load failed, falling back to seed catalog", err);
    return null;
  }
}

const getCachedCatalogFromDatabase = unstable_cache(
  queryCatalogFromDatabase,
  ["dime-catalog-from-db-v1"],
  { revalidate: 60 }
);

/**
 * Request-memoized DB catalog load (+ 60s cross-request cache).
 * Returns null when DB mode is off, URL missing, query fails, or empty.
 */
export const loadCatalogFromDatabase = cache(async (): Promise<CatalogProduct[] | null> => {
  if (!isGrowthDatabaseMode() || !isDatabaseUrlConfigured()) return null;
  // Avoid Postgres during `next build` SSG — parallel product/shop pages + a cold
  // pool previously stalled workers past Next's 60s static timeout on Vercel.
  if (process.env.NEXT_PHASE === "phase-production-build") return null;

  return getCachedCatalogFromDatabase();
});
