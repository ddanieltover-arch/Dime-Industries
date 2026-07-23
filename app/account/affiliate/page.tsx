// app/account/affiliate/page.tsx
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getOrCreateAffiliate } from "@/lib/affiliate/store";
import {
  availablePayoutCents,
  listPayouts,
  MIN_PAYOUT_CENTS,
} from "@/lib/affiliate/payouts";
import { PayoutRequestForm } from "@/components/affiliate/payout-request-form";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Affiliate",
  robots: { index: false, follow: false },
};

export default async function AccountAffiliatePage() {
  const profile = await requireUser();
  const account = await getOrCreateAffiliate(profile.email);
  const payouts = await listPayouts(profile.email);
  const available = availablePayoutCents(account, payouts);
  const sharePath = `/r/${account.referralCode}`;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Affiliate
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Share your referral link. Commission is {(account.commissionBps / 100).toFixed(0)}% of
          attributed paid order totals. Request payouts when you reach the minimum.
        </p>
      </section>

      <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Referral code
        </p>
        <p className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          {account.referralCode}
        </p>
        <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Link path:{" "}
          <span className="font-[var(--font-mono)] text-[var(--color-ink)]">{sharePath}</span>
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Clicks
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
            {account.clicks}
          </p>
        </div>
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Conversions
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
            {account.conversions}
          </p>
        </div>
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Earned
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
            {formatPrice(account.earnedCents)}
          </p>
        </div>
      </section>

      <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Payouts
        </h3>
        <PayoutRequestForm availableCents={available} minCents={MIN_PAYOUT_CENTS} />
        {payouts.length > 0 ? (
          <ul className="mt-6 space-y-2 text-[var(--scale-sm)]">
            {payouts.map((p) => (
              <li key={p.id} className="flex justify-between gap-2 border-t border-[var(--color-border)] pt-2">
                <span>
                  {p.id} · {p.status}
                </span>
                <span className="font-[var(--font-mono)]">{formatPrice(p.amountCents)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
