// components/admin/return-review-panel.tsx
"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  adminReviewReturnAction,
  type ReturnActionState,
} from "@/app/(commerce)/return-actions";
import type { ReturnRequest } from "@/lib/returns/types";
import { RETURN_REASON_LABELS, RETURN_STATUS_LABELS } from "@/lib/returns/types";

const initial: ReturnActionState = {};

function ReturnReviewRow({ request }: { request: ReturnRequest }) {
  const [state, action, pending] = useActionState(adminReviewReturnAction, initial);

  return (
    <li className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[var(--color-ink)]">{request.email}</p>
          <p className="mt-1 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            {request.id} · order{" "}
            <Link
              href={`/admin/orders`}
              className="underline-offset-2 hover:underline"
            >
              {request.orderId}
            </Link>
          </p>
          <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            {RETURN_REASON_LABELS[request.reason]} · {RETURN_STATUS_LABELS[request.status]}
          </p>
          {request.details ? (
            <p className="mt-2 max-w-xl text-[var(--scale-sm)] text-[var(--color-ink)]">
              {request.details}
            </p>
          ) : null}
        </div>
        <p className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
          {new Date(request.createdAt).toLocaleString()}
        </p>
      </div>

      {request.status === "requested" || request.status === "approved" ? (
        <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="returnId" value={request.id} />
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Admin note
            <input name="note" placeholder="Customer-visible note" className="field-input" />
          </label>
          {request.status === "requested" ? (
            <>
              <button
                type="submit"
                name="decision"
                value="approved"
                disabled={pending}
                className="btn-primary px-4 py-2"
              >
                Approve
              </button>
              <button
                type="submit"
                name="decision"
                value="denied"
                disabled={pending}
                className="btn-outline px-4 py-2 text-[var(--color-flag)]"
              >
                Deny
              </button>
              <button
                type="submit"
                name="decision"
                value="refunded"
                disabled={pending}
                className="btn-outline px-4 py-2"
              >
                Mark refunded
              </button>
            </>
          ) : (
            <button
              type="submit"
              name="decision"
              value="refunded"
              disabled={pending}
              className="btn-primary px-4 py-2"
            >
              Mark refunded
            </button>
          )}
          {state.error ? (
            <p role="alert" className="w-full text-[var(--scale-sm)] text-[var(--color-flag)]">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p role="status" className="w-full text-[var(--scale-sm)] text-[var(--color-resin)]">
              {state.success}
            </p>
          ) : null}
        </form>
      ) : null}
    </li>
  );
}

export function AdminReturnReviewPanel({ returns }: { returns: ReturnRequest[] }) {
  const actionable = returns.filter(
    (r) => r.status === "requested" || r.status === "approved"
  );
  const closed = returns.filter((r) => r.status === "denied" || r.status === "refunded");

  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Open queue
        </h3>
        {actionable.length === 0 ? (
          <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            No open return requests.
          </p>
        ) : (
          <ul className="mt-4 space-y-3" role="list">
            {actionable.map((r) => (
              <ReturnReviewRow key={r.id} request={r} />
            ))}
          </ul>
        )}
      </section>

      {closed.length > 0 ? (
        <section>
          <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
            Closed
          </h3>
          <ul className="mt-4 space-y-2 text-[var(--scale-sm)]" role="list">
            {closed.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap justify-between gap-2 border border-[var(--color-border)] px-4 py-3 text-[var(--color-ink-soft)]"
              >
                <span>
                  {r.email} · {r.orderId} · {RETURN_STATUS_LABELS[r.status]}
                </span>
                <span className="font-[var(--font-mono)] text-[var(--scale-xs)]">{r.id}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
