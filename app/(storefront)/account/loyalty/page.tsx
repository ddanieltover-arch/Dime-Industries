// app/account/loyalty/page.tsx
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getLoyaltyAccount, POINTS_PER_DOLLAR, REDEEM_POINTS_PER_DOLLAR } from "@/lib/loyalty/store";

export const metadata: Metadata = {
  title: "Loyalty",
  robots: { index: false, follow: false },
};

export default async function AccountLoyaltyPage() {
  const profile = await requireUser();
  const account = await getLoyaltyAccount(profile.email);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Loyalty
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Earn {POINTS_PER_DOLLAR} point per $1 paid. Redeem at {REDEEM_POINTS_PER_DOLLAR} points
          per $1 (redemption at checkout lands with DB-backed loyalty).
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Balance
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
            {account.pointsBalance}
          </p>
        </div>
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Lifetime
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
            {account.lifetimeEarned}
          </p>
        </div>
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Tier
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] capitalize text-[var(--color-ink)]">
            {account.tier}
          </p>
        </div>
      </section>

      <section>
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          History
        </h3>
        {account.history.length === 0 ? (
          <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            No points yet — complete a paid order to earn.
          </p>
        ) : (
          <ul className="mt-4 space-y-3" role="list">
            {account.history.map((entry) => (
              <li
                key={entry.id}
                className="flex justify-between gap-4 border-b border-[var(--color-border)] pb-3 text-[var(--scale-sm)]"
              >
                <div>
                  <p className="text-[var(--color-ink)]">{entry.reason}</p>
                  <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                    {new Date(entry.at).toLocaleString()}
                  </p>
                </div>
                <p className={entry.delta >= 0 ? "text-[var(--color-terp)]" : "text-[var(--color-flag)]"}>
                  {entry.delta >= 0 ? "+" : ""}
                  {entry.delta}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
