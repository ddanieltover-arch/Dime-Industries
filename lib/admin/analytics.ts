// lib/admin/analytics.ts — pure aggregations for dashboard KPIs / report CSV helpers
import type { CatalogProduct } from "@/lib/catalog/types";
import type { CheckoutOrder } from "@/lib/checkout/types";
import { adminOrderKpis } from "@/lib/admin/orders-admin";

export type CategoryBreakdown = {
  slug: string;
  name: string;
  products: number;
  active: number;
};

export type AnalyticsSnapshot = {
  orders: ReturnType<typeof adminOrderKpis>;
  catalog: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    variants: number;
    lowStock: number;
    outOfStock: number;
  };
  categories: CategoryBreakdown[];
  pendingReviews: number;
  loyaltyAccounts: number;
  openReturns: number;
};

export function buildCategoryBreakdown(catalog: CatalogProduct[]): CategoryBreakdown[] {
  const map = new Map<string, CategoryBreakdown>();
  for (const p of catalog) {
    const row = map.get(p.categorySlug) ?? {
      slug: p.categorySlug,
      name: p.categoryName,
      products: 0,
      active: 0,
    };
    row.products += 1;
    if (p.status === "active") row.active += 1;
    map.set(p.categorySlug, row);
  }
  return Array.from(map.values()).sort((a, b) => b.products - a.products);
}

export function buildAnalyticsSnapshot(input: {
  catalog: CatalogProduct[];
  orders: CheckoutOrder[];
  pendingReviews: number;
  loyaltyAccounts: number;
  openReturns: number;
}): AnalyticsSnapshot {
  const { catalog, orders } = input;
  let variants = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let active = 0;
  let draft = 0;
  let archived = 0;

  for (const p of catalog) {
    if (p.status === "active") active += 1;
    else if (p.status === "draft") draft += 1;
    else archived += 1;
    for (const v of p.variants) {
      variants += 1;
      if (v.quantityOnHand <= 0) outOfStock += 1;
      else if (v.quantityOnHand < 30) lowStock += 1;
    }
  }

  return {
    orders: adminOrderKpis(orders),
    catalog: {
      total: catalog.length,
      active,
      draft,
      archived,
      variants,
      lowStock,
      outOfStock,
    },
    categories: buildCategoryBreakdown(catalog),
    pendingReviews: input.pendingReviews,
    loyaltyAccounts: input.loyaltyAccounts,
    openReturns: input.openReturns,
  };
}

export type PaidOrderReportRow = {
  id: string;
  email: string;
  totalCents: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
};

export type LowStockReportRow = {
  productName: string;
  productSlug: string;
  sku: string;
  format: string;
  quantityOnHand: number;
};

export function buildPaidOrderRows(orders: CheckoutOrder[]): PaidOrderReportRow[] {
  return orders
    .filter((o) => o.status === "payment_confirmed")
    .map((o) => ({
      id: o.id,
      email: o.email,
      totalCents: o.totalCents,
      status: o.status,
      createdAt: o.createdAt,
      paidAt: o.paidAt ?? null,
    }))
    .sort((a, b) => (b.paidAt ?? b.createdAt).localeCompare(a.paidAt ?? a.createdAt));
}

export function buildLowStockRows(catalog: CatalogProduct[], threshold = 30): LowStockReportRow[] {
  const rows: LowStockReportRow[] = [];
  for (const p of catalog) {
    for (const v of p.variants) {
      if (v.quantityOnHand > 0 && v.quantityOnHand < threshold) {
        rows.push({
          productName: p.name,
          productSlug: p.slug,
          sku: v.sku,
          format: v.weightOrFormat,
          quantityOnHand: v.quantityOnHand,
        });
      }
    }
  }
  return rows.sort((a, b) => a.quantityOnHand - b.quantityOnHand);
}

export function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const escape = (cell: string | number | null) => {
    const raw = cell == null ? "" : String(cell);
    if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
    return raw;
  };
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}
