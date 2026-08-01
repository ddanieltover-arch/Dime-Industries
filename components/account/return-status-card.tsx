// components/account/return-status-card.tsx
import Link from "next/link";
import type { ReturnRequest } from "@/lib/returns/types";
import { RETURN_REASON_LABELS, RETURN_STATUS_LABELS } from "@/lib/returns/types";

export function ReturnStatusCard({ request }: { request: ReturnRequest }) {
  return (
    <section
      aria-labelledby={`return-status-${request.id}`}
      className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <h3
        id={`return-status-${request.id}`}
        className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]"
      >
        Return status
      </h3>
      <dl className="mt-4 space-y-2 text-[var(--scale-sm)]">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-ink-soft)]">Request</dt>
          <dd className="font-[var(--font-mono)] text-[var(--scale-xs)]">{request.id}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-ink-soft)]">Status</dt>
          <dd className="uppercase tracking-[0.08em] text-[var(--color-ink)]">
            {RETURN_STATUS_LABELS[request.status]}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-ink-soft)]">Reason</dt>
          <dd>{RETURN_REASON_LABELS[request.reason]}</dd>
        </div>
        {request.adminNote ? (
          <div className="border-t border-[var(--color-border)] pt-3">
            <dt className="text-[var(--color-ink-soft)]">Support note</dt>
            <dd className="mt-1 text-[var(--color-ink)]">{request.adminNote}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-4 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
        Submitted {new Date(request.createdAt).toLocaleString()}. See{" "}
        <Link href="/account/returns" className="text-[var(--color-resin)] hover:underline">
          all returns
        </Link>{" "}
        or the{" "}
        <Link href="/legal/returns" className="text-[var(--color-resin)] hover:underline">
          Returns Policy
        </Link>
        .
      </p>
    </section>
  );
}
