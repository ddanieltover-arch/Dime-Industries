// app/admin/wholesale/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { AdminWholesalePanel, AdminWholesalePriceForm } from "@/components/admin/wholesale-panel";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { formatPrice } from "@/lib/format";
import {
  defaultWholesalePriceCents,
  getWholesaleOverrides,
  listWholesaleAccounts,
  termsLabel,
} from "@/lib/wholesale";

export const metadata: Metadata = {
  title: "Wholesale admin",
  robots: { index: false, follow: false },
};

export default async function AdminWholesalePage() {
  await requireAdmin();
  const [accounts, overrides, catalog] = await Promise.all([
    listWholesaleAccounts(),
    getWholesaleOverrides(),
    loadEffectiveCatalog(),
  ]);

  const pending = accounts.filter((a) => a.status === "pending");
  const variants = catalog.flatMap((p) =>
    p.variants.map((v) => ({
      productName: p.name,
      variantId: v.id,
      sku: v.sku,
      retail: v.retailPriceCents,
      wholesale: overrides[v.id]?.priceCents ?? defaultWholesalePriceCents(v.retailPriceCents),
      moq: overrides[v.id]?.minQuantity ?? 5,
    }))
  );

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Wholesale accounts
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          {pending.length} pending · {accounts.length} total
        </p>
        <AdminWholesalePanel accounts={accounts} />
      </section>

      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Price overrides
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Default is 30% off retail with MOQ 5 unless overridden.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[var(--scale-sm)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-ink-soft)]">
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">SKU</th>
                <th className="py-2 pr-4">Retail</th>
                <th className="py-2 pr-4">Wholesale</th>
                <th className="py-2">MOQ</th>
              </tr>
            </thead>
            <tbody>
              {variants.slice(0, 24).map((v) => (
                <tr key={v.variantId} className="border-b border-[var(--color-border)]">
                  <td className="py-2 pr-4">{v.productName}</td>
                  <td className="py-2 pr-4 font-[var(--font-mono)] text-[var(--scale-xs)]">
                    {v.sku}
                  </td>
                  <td className="py-2 pr-4">{formatPrice(v.retail)}</td>
                  <td className="py-2 pr-4">{formatPrice(v.wholesale)}</td>
                  <td className="py-2">{v.moq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminWholesalePriceForm
          variants={variants.slice(0, 24).map((v) => ({
            variantId: v.variantId,
            label: `${v.productName} (${v.sku})`,
            priceDollars: (v.wholesale / 100).toFixed(2),
            moq: v.moq,
          }))}
        />
      </section>

      <p className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Tip: approved accounts use {termsLabel("net30")} / {termsLabel("net60")} / upfront at checkout.
      </p>
    </div>
  );
}
