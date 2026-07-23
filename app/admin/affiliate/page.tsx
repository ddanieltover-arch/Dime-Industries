// app/admin/affiliate/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { affiliateFinanceSummary } from "@/lib/affiliate/payouts";
import { AdminAffiliatePayoutPanel } from "@/components/admin/affiliate-payout-panel";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Admin affiliate",
  robots: { index: false, follow: false },
};

export default async function AdminAffiliatePage() {
  await requireAdmin();
  const { accounts, payouts, pendingCents, paidCents } = await affiliateFinanceSummary();

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Affiliate
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Referral performance and payout finance queue.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-[var(--scale-sm)]">
          <div className="border border-[var(--color-border)] p-3">
            <dt className="text-[var(--color-ink-soft)]">Pending payouts</dt>
            <dd className="mt-1 font-[var(--font-display)] text-[var(--scale-xl)]">
              {formatPrice(pendingCents)}
            </dd>
          </div>
          <div className="border border-[var(--color-border)] p-3">
            <dt className="text-[var(--color-ink-soft)]">Paid out</dt>
            <dd className="mt-1 font-[var(--font-display)] text-[var(--scale-xl)]">
              {formatPrice(paidCents)}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)]">Payout queue</h3>
        <div className="mt-4">
          <AdminAffiliatePayoutPanel payouts={payouts} />
        </div>
      </section>

      <section>
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)]">Accounts</h3>
        {accounts.length === 0 ? (
          <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            No affiliates yet — customers create a code on /account/affiliate.
          </p>
        ) : (
          <ul className="mt-4 space-y-3" role="list">
            {accounts.map((a) => (
              <li
                key={a.email}
                className="flex flex-wrap justify-between gap-2 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--scale-sm)]"
              >
                <div>
                  <p className="text-[var(--color-ink)]">{a.email}</p>
                  <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                    {a.referralCode}
                  </p>
                </div>
                <p className="font-[var(--font-mono)] text-[var(--color-ink-soft)]">
                  {a.clicks} clicks · {a.conversions} conv · {formatPrice(a.earnedCents)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
