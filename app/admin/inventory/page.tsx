// app/admin/inventory/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminCatalog } from "@/lib/admin/catalog-overrides";
import { InventoryForm } from "@/components/admin/inventory-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata: Metadata = {
  title: "Admin inventory",
  robots: { index: false, follow: false },
};

export default async function AdminInventoryPage() {
  await requireAdmin();
  const products = await getAdminCatalog();
  const rows = products.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      productName: p.name,
      variantId: v.id,
      sku: v.sku,
      format: v.weightOrFormat,
      quantityOnHand: v.quantityOnHand,
    }))
  );
  rows.sort((a, b) => a.quantityOnHand - b.quantityOnHand);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Inventory"
        description="Sorted low to high. Adjust quantities for drop readiness."
      />
      <div className="overflow-x-auto">
        <table className="admin-table min-w-[40rem]">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Format</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.variantId}>
                <td className="text-[var(--color-ink)]">{row.productName}</td>
                <td className="font-[var(--font-mono)] text-[var(--color-ink-soft)]">{row.sku}</td>
                <td className="text-[var(--color-ink-soft)]">{row.format}</td>
                <td>
                  <InventoryForm
                    productId={row.productId}
                    variantId={row.variantId}
                    quantityOnHand={row.quantityOnHand}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
