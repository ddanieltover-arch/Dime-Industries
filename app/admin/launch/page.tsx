// app/admin/launch/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getLaunchStatus } from "@/lib/ops/launch-status";
import { getOrderRepository } from "@/lib/checkout";

export const metadata: Metadata = {
  title: "Launch status",
  robots: { index: false, follow: false },
};

export default async function AdminLaunchPage() {
  await requireAdmin();
  const status = getLaunchStatus();
  const orders = getOrderRepository();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Launch status
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Soft-launch configuration and persistence mode. Public probe:{" "}
          <Link href="/api/ready" className="underline-offset-4 hover:underline">
            /api/ready
          </Link>
          .
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Public traffic
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
            {status.readyForPublicTraffic ? "Ready" : "Blocked"}
          </p>
        </div>
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Soft launch
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
            {status.softLaunch ? "Yes" : "No"}
          </p>
        </div>
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Orders persistence
          </p>
          <p className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
            {orders.mode}
          </p>
        </div>
      </section>

      <ul className="space-y-3" role="list">
        {status.checks.map((check) => (
          <li
            key={check.id}
            className="border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-[var(--font-mono)] text-[var(--scale-xs)] uppercase text-[var(--color-ink-soft)]">
                {check.id} · {check.severity}
              </p>
              <p
                className={
                  check.ok ? "text-[var(--scale-sm)] text-[var(--color-terp)]" : "text-[var(--scale-sm)] text-[var(--color-flag)]"
                }
              >
                {check.ok ? "OK" : "Attention"}
              </p>
            </div>
            <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink)]">{check.message}</p>
          </li>
        ))}
      </ul>

      <p className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Checked at {new Date(status.checkedAt).toLocaleString()} · env {status.environment}. See{" "}
        <code className="font-[var(--font-mono)]">docs/27-soft-launch-debt.md</code> for the backlog.
      </p>
    </div>
  );
}
