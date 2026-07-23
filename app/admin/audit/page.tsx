// app/admin/audit/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { listAuditEntries } from "@/lib/admin/audit";

export const metadata: Metadata = {
  title: "Admin audit",
  robots: { index: false, follow: false },
};

export default async function AdminAuditPage() {
  await requireAdmin();
  const entries = await listAuditEntries();

  return (
    <div>
      <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
        Audit log
      </h2>
      <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Recent admin mutations in this browser (max 50). Also logged server-side.
      </p>
      {entries.length === 0 ? (
        <p className="mt-8 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">No audited actions yet.</p>
      ) : (
        <ul className="mt-8 space-y-2" role="list">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="border border-[var(--color-border)] px-4 py-3 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]"
            >
              {new Date(entry.at).toLocaleString()} · {entry.actorEmail} · {entry.action} ·{" "}
              {entry.entity}/{entry.entityId}
              {entry.detail ? ` · ${entry.detail}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
