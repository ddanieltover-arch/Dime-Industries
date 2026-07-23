// app/admin/inventory/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminCatalog } from "@/lib/admin/catalog-overrides";
import { InventoryForm } from "@/components/admin/inventory-form";

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
      <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
        Inventory
      </h2>
      <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Sorted low → high. Adjust quantities for drop readiness.
      </p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-[var(--scale-sm)]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-ink-soft)]">
              <th className="py-2 pr-4 font-normal">Product</th>
              <th className="py-2 pr-4 font-normal">SKU</th>
              <th className="py-2 pr-4 font-normal">Format</th>
              <th className="py-2 font-normal">Qty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.variantId} className="border-b border-[var(--color-border)]">
                <td className="py-3 pr-4 text-[var(--color-ink)]">{row.productName}</td>
                <td className="py-3 pr-4 font-[var(--font-mono)] text-[var(--color-ink-soft)]">
                  {row.sku}
                </td>
                <td className="py-3 pr-4 text-[var(--color-ink-soft)]">{row.format}</td>
                <td className="py-3">
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
