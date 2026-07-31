// db/seed-brand-catalog.ts
// Upserts SEED_CATALOG (reference-site import) into Postgres catalog tables.
// Idempotent — safe to re-run. Loads DATABASE_URL from .env.local when unset.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  CATALOG_CATEGORIES,
  CATALOG_LINES,
  SEED_CATALOG,
} from "../lib/catalog/seed-catalog";
import * as schema from "./schema";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      const key = m[1]!;
      let val = m[2]!.trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // optional
  }
}

/** Prefer transaction pooler (6543) to avoid session-mode EMAXCONNSESSION. */
function connectionUrl(raw: string): string {
  try {
    const u = new URL(raw);
    if (u.hostname.includes("pooler.supabase.com") && u.port === "5432") {
      u.port = "6543";
    }
    return u.toString();
  } catch {
    return raw;
  }
}

async function main() {
  loadEnvLocal();
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const url = connectionUrl(rawUrl);
  console.log("Host:", url.replace(/:[^:@/]+@/, ":****@"));

  const client = postgres(url, {
    prepare: false,
    max: 1,
    ssl: "require",
    connect_timeout: 30,
  });
  const db = drizzle(client, { schema });

  // --- Categories ----------------------------------------------------------
  for (const cat of CATALOG_CATEGORIES) {
    await db
      .insert(schema.categories)
      .values({ slug: cat.slug, name: cat.name })
      .onConflictDoUpdate({
        target: schema.categories.slug,
        set: { name: cat.name },
      });
  }
  const categoryRows = await db.select().from(schema.categories);
  const categoryBySlug = new Map(categoryRows.map((r) => [r.slug, r.id]));

  // --- Product lines -------------------------------------------------------
  for (const line of CATALOG_LINES) {
    await db
      .insert(schema.productLines)
      .values({ slug: line.slug, name: line.name })
      .onConflictDoUpdate({
        target: schema.productLines.slug,
        set: { name: line.name },
      });
  }
  const lineRows = await db.select().from(schema.productLines);
  const lineBySlug = new Map(lineRows.map((r) => [r.slug, r.id]));

  let productsUpserted = 0;
  let variantsUpserted = 0;
  let inventoryRows = 0;
  let coaRows = 0;

  for (const product of SEED_CATALOG) {
    const categoryId = categoryBySlug.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for slug ${product.categorySlug}`);
    }
    const lineId = product.lineSlug ? lineBySlug.get(product.lineSlug) ?? null : null;

    await db
      .insert(schema.products)
      .values({
        slug: product.slug,
        name: product.name,
        categoryId,
        lineId,
        strainType: product.strainType,
        description: product.description,
        status: product.status,
        allowedJurisdictions: product.allowedJurisdictions,
        imageUrl: product.imageUrl,
        galleryUrls: product.galleryUrls ?? [],
        createdAt: new Date(product.createdAt),
      })
      .onConflictDoUpdate({
        target: schema.products.slug,
        set: {
          name: product.name,
          categoryId,
          lineId,
          strainType: product.strainType,
          description: product.description,
          status: product.status,
          allowedJurisdictions: product.allowedJurisdictions,
        },
      });

    const [row] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.slug, product.slug))
      .limit(1);
    if (!row) throw new Error(`Product missing after upsert: ${product.slug}`);
    productsUpserted += 1;

    // Fill image columns once from seed; never clobber Supabase Storage URLs.
    const needsImage =
      (!row.imageUrl || row.imageUrl.length === 0) && Boolean(product.imageUrl);
    if (needsImage) {
      await db
        .update(schema.products)
        .set({
          imageUrl: product.imageUrl,
          galleryUrls: product.galleryUrls ?? [],
        })
        .where(eq(schema.products.id, row.id));
    }

    if (product.coaUrl) {
      const existingCoa = await db
        .select()
        .from(schema.coaRecords)
        .where(eq(schema.coaRecords.productId, row.id))
        .limit(1);
      if (existingCoa.length === 0) {
        await db.insert(schema.coaRecords).values({
          productId: row.id,
          externalCoaUrl: product.coaUrl,
          batchId: null,
          testedAt: null,
        });
        coaRows += 1;
      }
    }

    for (const variant of product.variants) {
      await db
        .insert(schema.productVariants)
        .values({
          productId: row.id,
          sku: variant.sku,
          weightOrFormat: variant.weightOrFormat,
          retailPriceCents: variant.retailPriceCents,
        })
        .onConflictDoUpdate({
          target: schema.productVariants.sku,
          set: {
            productId: row.id,
            weightOrFormat: variant.weightOrFormat,
            retailPriceCents: variant.retailPriceCents,
          },
        });

      const [vRow] = await db
        .select()
        .from(schema.productVariants)
        .where(eq(schema.productVariants.sku, variant.sku))
        .limit(1);
      if (!vRow) throw new Error(`Variant missing after upsert: ${variant.sku}`);
      variantsUpserted += 1;

      await db
        .insert(schema.productPotency)
        .values({
          variantId: vRow.id,
          thcPct: String(variant.thcPct),
          cbdPct: String(variant.cbdPct),
          cbnPct: variant.cbnPct == null ? null : String(variant.cbnPct),
        })
        .onConflictDoUpdate({
          target: schema.productPotency.variantId,
          set: {
            thcPct: String(variant.thcPct),
            cbdPct: String(variant.cbdPct),
            cbnPct: variant.cbnPct == null ? null : String(variant.cbnPct),
          },
        });

      const jurisdictions =
        product.allowedJurisdictions.length > 0
          ? product.allowedJurisdictions
          : ["CA"];
      for (const jurisdiction of jurisdictions) {
        await db
          .insert(schema.inventory)
          .values({
            variantId: vRow.id,
            jurisdiction,
            quantityOnHand: variant.quantityOnHand,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [schema.inventory.variantId, schema.inventory.jurisdiction],
            set: {
              quantityOnHand: variant.quantityOnHand,
              updatedAt: new Date(),
            },
          });
        inventoryRows += 1;
      }

      // Growth-mode inventory uses seed string variant ids (not UUID FKs).
      await db
        .insert(schema.commerceInventory)
        .values({
          variantId: variant.id,
          quantityOnHand: variant.quantityOnHand,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.commerceInventory.variantId,
          set: {
            quantityOnHand: variant.quantityOnHand,
            updatedAt: new Date(),
          },
        });
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        products: productsUpserted,
        variants: variantsUpserted,
        inventoryRows,
        coaRows,
        categories: categoryRows.length,
        lines: lineRows.length,
        catalogSize: SEED_CATALOG.length,
      },
      null,
      2
    )
  );

  await client.end({ timeout: 5 });
}

main().catch(async (err) => {
  console.error("Brand catalog seed failed:", err);
  process.exit(1);
});
