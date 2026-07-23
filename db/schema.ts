// DIME Enterprise Commerce Platform — Drizzle ORM schema (PostgreSQL / Supabase)
// Database Mode deliverable. No application/business logic lives here — schema only.

import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
  check,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Identity & access
// ---------------------------------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    phone: text("phone"),
    role: text("role").notNull().default("customer"),
    ageVerifiedAt: timestamp("age_verified_at", { withTimezone: true }),
    jurisdiction: text("jurisdiction"), // 'CA' | 'MA' at launch
    medicalPatient: boolean("medical_patient").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
    roleCheck: check(
      "users_role_check",
      sql`${t.role} in ('guest','customer','wholesale','admin','vendor')`
    ),
  })
);

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    jurisdiction: text("jurisdiction").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (t) => ({
    byUser: index("addresses_user_idx").on(t.userId),
    byJurisdiction: index("addresses_jurisdiction_idx").on(t.jurisdiction),
  })
);

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
}, (t) => ({
  slugUnique: uniqueIndex("categories_slug_unique").on(t.slug),
}));

export const productLines = pgTable("product_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
}, (t) => ({
  slugUnique: uniqueIndex("product_lines_slug_unique").on(t.slug),
}));

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    categoryId: uuid("category_id").notNull().references(() => categories.id),
    lineId: uuid("line_id").references(() => productLines.id),
    strainType: text("strain_type"),
    description: text("description"),
    status: text("status").notNull().default("draft"),
    allowedJurisdictions: text("allowed_jurisdictions").array().notNull().default(sql`'{}'::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugUnique: uniqueIndex("products_slug_unique").on(t.slug),
    byCategoryStatus: index("products_category_status_idx").on(t.categoryId, t.status),
    jurisdictionGin: index("products_jurisdiction_gin_idx").using("gin", t.allowedJurisdictions),
    strainCheck: check(
      "products_strain_type_check",
      sql`${t.strainType} in ('sativa','indica','hybrid','na')`
    ),
    statusCheck: check(
      "products_status_check",
      sql`${t.status} in ('draft','active','archived')`
    ),
  })
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    weightOrFormat: text("weight_or_format").notNull(),
    retailPriceCents: integer("retail_price_cents").notNull(),
    vendorId: uuid("vendor_id"), // reserved, nullable — multi-vendor readiness
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    skuUnique: uniqueIndex("product_variants_sku_unique").on(t.sku),
    byProduct: index("product_variants_product_idx").on(t.productId),
    priceNonNegative: check("product_variants_price_nonneg", sql`${t.retailPriceCents} >= 0`),
  })
);

export const productPotency = pgTable("product_potency", {
  variantId: uuid("variant_id").primaryKey().references(() => productVariants.id, { onDelete: "cascade" }),
  thcPct: numeric("thc_pct", { precision: 5, scale: 2 }),
  cbdPct: numeric("cbd_pct", { precision: 5, scale: 2 }),
  cbnPct: numeric("cbn_pct", { precision: 5, scale: 2 }),
});

export const coaRecords = pgTable(
  "coa_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    externalCoaUrl: text("external_coa_url").notNull(),
    batchId: text("batch_id"),
    testedAt: date("tested_at"),
    syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byProduct: index("coa_records_product_idx").on(t.productId),
  })
);

export const inventory = pgTable(
  "inventory",
  {
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    jurisdiction: text("jurisdiction").notNull(),
    quantityOnHand: integer("quantity_on_hand").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.variantId, t.jurisdiction] }),
    qtyNonNegative: check("inventory_qty_nonneg", sql`${t.quantityOnHand} >= 0`),
  })
);

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export const wishlists = pgTable(
  "wishlists",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.variantId] }),
  })
);

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    type: text("type").notNull(), // 'percentage' | 'fixed' | 'bogo'
    value: integer("value").notNull(), // percentage points or cents, per `type`
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").notNull().default(0),
  },
  (t) => ({
    codeUnique: uniqueIndex("coupons_code_unique").on(t.code),
    typeCheck: check("coupons_type_check", sql`${t.type} in ('percentage','fixed','bogo')`),
  })
);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const wholesaleAccounts = pgTable(
  "wholesale_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    businessName: text("business_name").notNull(),
    resaleCertUrl: text("resale_cert_url"),
    approved: boolean("approved").notNull().default(false),
    defaultPaymentTerms: text("default_payment_terms").notNull().default("upfront"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byUser: uniqueIndex("wholesale_accounts_user_unique").on(t.userId),
    termsCheck: check(
      "wholesale_accounts_terms_check",
      sql`${t.defaultPaymentTerms} in ('net30','net60','upfront')`
    ),
  })
);

export const wholesalePricingTiers = pgTable(
  "wholesale_pricing_tiers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    wholesaleAccountId: uuid("wholesale_account_id").references(() => wholesaleAccounts.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id),
    priceCents: integer("price_cents").notNull(),
    minQuantity: integer("min_quantity").notNull().default(1),
  },
  (t) => ({
    byAccountVariant: uniqueIndex("wholesale_pricing_account_variant_unique").on(
      t.wholesaleAccountId,
      t.variantId
    ),
  })
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id),
    wholesaleAccountId: uuid("wholesale_account_id").references(() => wholesaleAccounts.id),
    status: text("status").notNull().default("pending"),
    addressId: uuid("address_id").references(() => addresses.id),
    couponId: uuid("coupon_id").references(() => coupons.id),
    subtotalCents: integer("subtotal_cents").notNull(),
    taxCents: integer("tax_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    paymentMethod: text("payment_method").notNull().default("paybis_btc"),
    paymentTerms: text("payment_terms"), // null=retail; 'net30'|'net60'|'upfront' for wholesale
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byUserCreated: index("orders_user_created_idx").on(t.userId, t.createdAt),
    statusCheck: check(
      "orders_status_check",
      sql`${t.status} in ('pending','payment_confirmed','fulfilling','shipped','delivered','return_requested','returned','cancelled')`
    ),
    totalsNonNegative: check(
      "orders_totals_nonneg",
      sql`${t.subtotalCents} >= 0 and ${t.taxCents} >= 0 and ${t.totalCents} >= 0`
    ),
    paymentTermsCheck: check(
      "orders_payment_terms_check",
      sql`${t.paymentTerms} is null or ${t.paymentTerms} in ('net30','net60','upfront')`
    ),
    // A retail order (no wholesale_account_id) should never carry payment
    // terms — those only make sense for wholesale. Catches a class of bug
    // where the checkout code accidentally stamps terms onto a retail order.
    walletTermsConsistency: check(
      "orders_wholesale_terms_consistency",
      sql`${t.wholesaleAccountId} is not null or ${t.paymentTerms} is null`
    ),
  })
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
  },
  (t) => ({
    byOrder: index("order_items_order_idx").on(t.orderId),
    qtyPositive: check("order_items_qty_positive", sql`${t.quantity} > 0`),
  })
);

export const returns = pgTable(
  "returns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    reason: text("reason"),
    status: text("status").notNull().default("requested"),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => ({
    statusCheck: check(
      "returns_status_check",
      sql`${t.status} in ('requested','approved','rejected','completed')`
    ),
  })
);

// ---------------------------------------------------------------------------
// Loyalty & affiliate
// ---------------------------------------------------------------------------

export const loyaltyAccounts = pgTable("loyalty_accounts", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  pointsBalance: integer("points_balance").notNull().default(0),
  tier: text("tier").notNull().default("standard"),
  syncedWithDimeRewardsAt: timestamp("synced_with_dime_rewards_at", { withTimezone: true }),
});

export const affiliateAccounts = pgTable("affiliate_accounts", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  referralCode: text("referral_code").notNull(),
  payoutTerms: text("payout_terms"),
  totalEarnedCents: integer("total_earned_cents").notNull().default(0),
}, (t) => ({
  codeUnique: uniqueIndex("affiliate_accounts_code_unique").on(t.referralCode),
}));

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id),
    rating: integer("rating").notNull(),
    body: text("body"),
    verifiedPurchase: boolean("verified_purchase").notNull().default(false),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byProduct: index("reviews_product_idx").on(t.productId),
    oneReviewPerUserPerProduct: uniqueIndex("reviews_product_user_unique").on(t.productId, t.userId),
    ratingRange: check("reviews_rating_range", sql`${t.rating} between 1 and 5`),
    statusCheck: check(
      "reviews_status_check",
      sql`${t.status} in ('pending','approved','rejected')`
    ),
  })
);

// ---------------------------------------------------------------------------
// CMS & settings
// ---------------------------------------------------------------------------

export const cmsPages = pgTable("cms_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  blocks: jsonb("blocks").notNull().default(sql`'[]'::jsonb`),
  status: text("status").notNull().default("draft"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  slugUnique: uniqueIndex("cms_pages_slug_unique").on(t.slug),
}));

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: uuid("entity_id"),
    diff: jsonb("diff"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byEntity: index("audit_logs_entity_idx").on(t.entity, t.entityId),
    byCreated: index("audit_logs_created_idx").on(t.createdAt),
  })
);

// ---------------------------------------------------------------------------
 // Commerce checkout snapshots (Sprint 10) — durable Paybis-aware orders
 // ---------------------------------------------------------------------------

export const commerceOrders = pgTable(
  "commerce_orders",
  {
    id: text("id").primaryKey(),
    status: text("status").notNull(),
    email: text("email").notNull(),
    jurisdiction: text("jurisdiction").notNull(),
    payload: jsonb("payload").notNull(),
    paymentRequestId: text("payment_request_id"),
    paymentMode: text("payment_mode"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byEmailCreated: index("commerce_orders_email_created_idx").on(t.email, t.createdAt),
    paymentRequestUnique: uniqueIndex("commerce_orders_payment_request_uidx").on(t.paymentRequestId),
  })
);

export const commerceCarts = pgTable("commerce_carts", {
  ownerKey: text("owner_key").primaryKey(),
  items: jsonb("items").notNull().default(sql`'[]'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commerceCmsPages = pgTable("commerce_cms_pages", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("draft"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commerceBlogPosts = pgTable("commerce_blog_posts", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commerceCoupons = pgTable(
  "commerce_coupons",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    type: text("type").notNull(),
    value: integer("value").notNull(),
    minSubtotalCents: integer("min_subtotal_cents").notNull().default(0),
    active: boolean("active").notNull().default(true),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").notNull().default(0),
  },
  (t) => ({
    codeUnique: uniqueIndex("commerce_coupons_code_unique").on(t.code),
  })
);

export const commerceLoyalty = pgTable("commerce_loyalty", {
  email: text("email").primaryKey(),
  pointsBalance: integer("points_balance").notNull().default(0),
  lifetimeEarned: integer("lifetime_earned").notNull().default(0),
  tier: text("tier").notNull().default("standard"),
  history: jsonb("history").notNull().default(sql`'[]'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commerceAffiliates = pgTable(
  "commerce_affiliates",
  {
    email: text("email").primaryKey(),
    referralCode: text("referral_code").notNull(),
    clicks: integer("clicks").notNull().default(0),
    conversions: integer("conversions").notNull().default(0),
    earnedCents: integer("earned_cents").notNull().default(0),
    commissionBps: integer("commission_bps").notNull().default(1000),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    codeUnique: uniqueIndex("commerce_affiliates_code_unique").on(t.referralCode),
  })
);

export const commerceCatalogOverrides = pgTable("commerce_catalog_overrides", {
  productId: text("product_id").primaryKey(),
  override: jsonb("override").notNull().default(sql`'{}'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commerceWishlists = pgTable("commerce_wishlists", {
  ownerKey: text("owner_key").primaryKey(),
  variantIds: jsonb("variant_ids").notNull().default(sql`'[]'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commerceInventory = pgTable("commerce_inventory", {
  variantId: text("variant_id").primaryKey(),
  quantityOnHand: integer("quantity_on_hand").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commerceInventoryReservations = pgTable("commerce_inventory_reservations", {
  orderId: text("order_id").primaryKey(),
  items: jsonb("items").notNull().default(sql`'[]'::jsonb`),
  status: text("status").notNull().default("reserved"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commerceWholesaleAccounts = pgTable("commerce_wholesale_accounts", {
  email: text("email").primaryKey(),
  businessName: text("business_name").notNull(),
  licenseNumber: text("license_number"),
  resaleCertUrl: text("resale_cert_url"),
  status: text("status").notNull().default("pending"),
  defaultPaymentTerms: text("default_payment_terms").notNull().default("net30"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const commerceWholesalePriceOverrides = pgTable("commerce_wholesale_price_overrides", {
  variantId: text("variant_id").primaryKey(),
  priceCents: integer("price_cents").notNull(),
  minQuantity: integer("min_quantity").notNull().default(5),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commerceAffiliatePayouts = pgTable("commerce_affiliate_payouts", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: text("status").notNull().default("pending"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// Relations (Drizzle relational query API)
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many, one }) => ({
  addresses: many(addresses),
  orders: many(orders),
  wishlists: many(wishlists),
  reviews: many(reviews),
  wholesaleAccount: one(wholesaleAccounts),
  loyaltyAccount: one(loyaltyAccounts),
  affiliateAccount: one(affiliateAccounts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  line: one(productLines, { fields: [products.lineId], references: [productLines.id] }),
  variants: many(productVariants),
  reviews: many(reviews),
  coaRecords: many(coaRecords),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  potency: one(productPotency, {
    fields: [productVariants.id],
    references: [productPotency.variantId],
  }),
  inventory: many(inventory),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  address: one(addresses, { fields: [orders.addressId], references: [addresses.id] }),
  coupon: one(coupons, { fields: [orders.couponId], references: [coupons.id] }),
  items: many(orderItems),
  wholesaleAccount: one(wholesaleAccounts, {
    fields: [orders.wholesaleAccountId],
    references: [wholesaleAccounts.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}));

export const wholesaleAccountsRelations = relations(wholesaleAccounts, ({ one, many }) => ({
  user: one(users, { fields: [wholesaleAccounts.userId], references: [users.id] }),
  pricingTiers: many(wholesalePricingTiers),
  orders: many(orders),
}));
