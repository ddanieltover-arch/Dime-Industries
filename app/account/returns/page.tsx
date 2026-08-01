// app/account/returns/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listReturns } from "@/lib/returns/store";
import { RETURN_REASON_LABELS, RETURN_STATUS_LABELS } from "@/lib/returns/types";

export const metadata: Metadata = {
  title: "Returns",
  robots: { index: false, follow: false },
};

export default async function AccountReturnsPage() {
  const profile = await requireUser();
  const returns = await listReturns(profile.email);

  return (
    <div>
      <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
        Returns
      </h2>
      <p className="mt-2 max-w-xl text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Track return and refund requests for paid orders. Start a request from an{" "}
        <Link href="/account/orders" className="text-[var(--color-resin)] hover:underline">
          order detail
        </Link>{" "}
        page. Policy:{" "}
        <Link href="/legal/returns" className="text-[var(--color-resin)] hover:underline">
          Returns Policy
        </Link>
        .
      </p>

      {returns.length === 0 ? (
        <p className="mt-8 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          No return requests yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-3" role="list">
          {returns.map((r) => (
            <li key={r.id} className="bg-[var(--color-surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-[var(--font-display)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                    {RETURN_STATUS_LABELS[r.status]}
                  </p>
                  <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                    {RETURN_REASON_LABELS[r.reason]} · order{" "}
                    <Link
                      href={`/account/orders/${r.orderId}`}
                      className="text-[var(--color-resin)] hover:underline"
                    >
                      {r.orderId}
                    </Link>
                  </p>
                  {r.adminNote ? (
                    <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink)]">
                      Support: {r.adminNote}
                    </p>
                  ) : null}
                </div>
                <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                  {r.id}
                </p>
              </div>
              <p className="mt-3 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                Submitted {new Date(r.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
