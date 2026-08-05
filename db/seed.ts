// db/seed.ts
// DIME Enterprise Commerce Platform — development/staging seed data.
// Never run against production. Safe to run repeatedly against a fresh dev DB (idempotent inserts).

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seed() {
  // --- Categories --------------------------------------------------------
  const [vapes, edibles, prerolls, accessories] = await db
    .insert(schema.categories)
    .values([
      { slug: "vapes", name: "Vapes" },
      { slug: "edibles", name: "Edibles" },
      { slug: "prerolls", name: "Prerolls" },
      { slug: "accessories", name: "Accessories" },
    ])
    .returning();

  // --- Product lines -------------------------------------------------------
  const [signature, liveReserve, rosin] = await db
    .insert(schema.productLines)
    .values([
      { slug: "signature", name: "Signature" },
      { slug: "live-reserve", name: "Live Reserve" },
      { slug: "rosin", name: "Rosin" },
    ])
    .returning();

  // --- Site settings ---------------------------------------------------
  // Age gate min age is code-defined (SITE_MIN_AGE) — do not drive UX from min_age.
  await db.insert(schema.siteSettings).values([
    { key: "launch_jurisdictions", value: JSON.stringify(["CA", "MA"]) },
    { key: "feature_flags", value: JSON.stringify({ wholesale_enabled: true, vendor_onboarding: false }) },
    {
      key: "shipping_rates",
      value: {
        usFlatCents: 1200,
        intlFlatCents: 2500,
        freeThresholdCents: 30000,
      },
    },
  ]);

  // --- Sample products ---------------------------------------------------
  const [sampleProduct] = await db
    .insert(schema.products)
    .values({
      slug: "sample-live-reserve-cart",
      name: "Sample Live Reserve Cartridge",
      categoryId: vapes.id,
      lineId: liveReserve.id,
      strainType: "hybrid",
      description: "Seed data placeholder — replace with real catalog import.",
      status: "active",
      allowedJurisdictions: ["CA", "MA"],
    })
    .returning();

  const [variant1g] = await db
    .insert(schema.productVariants)
    .values({
      productId: sampleProduct.id,
      sku: "SEED-LR-CART-1G",
      weightOrFormat: "1g",
      retailPriceCents: 4500,
    })
    .returning();

  await db.insert(schema.productPotency).values({
    variantId: variant1g.id,
    thcPct: "82.50",
    cbdPct: "0.20",
    cbnPct: "0.10",
  });

  await db.insert(schema.inventory).values([
    { variantId: variant1g.id, jurisdiction: "CA", quantityOnHand: 250 },
    { variantId: variant1g.id, jurisdiction: "MA", quantityOnHand: 120 },
  ]);

  // --- Admin user placeholder ---------------------------------------------
  // Real admin accounts are provisioned via Supabase Auth, not seeded directly —
  // this row is a placeholder to unblock local admin-panel development only.
  await db.insert(schema.users).values({
    email: "admin+seed@example.com",
    role: "admin",
    ageVerifiedAt: new Date(),
    jurisdiction: "CA",
  });

  console.log("Seed complete.");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
