// app/admin/loyalty/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { listLoyaltyAccounts } from "@/lib/loyalty/store";
import { LoyaltyAdjustForm } from "@/components/admin/growth-admin-forms";

export const metadata: Metadata = {
  title: "Admin loyalty",
  robots: { index: false, follow: false },
};

export default async function AdminLoyaltyPage() {
  await requireAdmin();
  const accounts = await listLoyaltyAccounts();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Loyalty
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Session-backed balances. Accounts appear after earn events or manual adjustments.
        </p>
      </section>
      <LoyaltyAdjustForm />
      {accounts.length === 0 ? (
        <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">No loyalty accounts yet.</p>
      ) : (
        <ul className="space-y-3" role="list">
          {accounts.map((a) => (
            <li
              key={a.email}
              className="flex flex-wrap justify-between gap-2 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--scale-sm)]"
            >
              <span className="text-[var(--color-ink)]">{a.email}</span>
              <span className="font-[var(--font-mono)] text-[var(--color-ink-soft)]">
                {a.pointsBalance} pts · {a.tier} · life {a.lifetimeEarned}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
