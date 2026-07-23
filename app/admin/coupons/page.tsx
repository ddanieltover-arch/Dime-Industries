// app/admin/coupons/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { listCoupons } from "@/lib/coupons/store";
import { CouponFormAdmin } from "@/components/admin/growth-admin-forms";

export const metadata: Metadata = {
  title: "Admin coupons",
  robots: { index: false, follow: false },
};

export default async function AdminCouponsPage() {
  await requireAdmin();
  const coupons = await listCoupons();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Coupons
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Percentage or fixed-cent discounts. Applied codes live in the shopper session cookie.
        </p>
      </section>
      <section>
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Add coupon
        </h3>
        <div className="mt-4">
          <CouponFormAdmin />
        </div>
      </section>
      <section className="space-y-4">
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Catalog
        </h3>
        {coupons.map((coupon) => (
          <CouponFormAdmin key={coupon.id} coupon={coupon} />
        ))}
      </section>
    </div>
  );
}
