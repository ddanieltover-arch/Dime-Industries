// app/admin/settings/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/admin/site-settings-store";
import { getLaunchStatus } from "@/lib/ops/launch-status";
import { SITE_MIN_AGE } from "@/lib/compliance/jurisdictions";
import { SiteSettingsForm } from "@/components/admin/site-settings-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata: Metadata = {
  title: "Admin settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings, launch] = await Promise.all([getSiteSettings(), Promise.resolve(getLaunchStatus())]);

  const marketCount = settings.jurisdictions.length;
  const blockers = launch.checks.filter((c) => !c.ok && c.severity === "blocker").length;
  const warnings = launch.checks.filter((c) => !c.ok && c.severity === "warning").length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="System"
        title="Settings"
        description="Control launch markets, program flags, and readiness. Homepage content lives under CMS."
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusChip
              tone={launch.readyForPublicTraffic ? "good" : "bad"}
              label={launch.readyForPublicTraffic ? "Launch ready" : "Launch blocked"}
            />
            {launch.softLaunch ? <StatusChip tone="neutral" label="Soft launch" /> : null}
            <StatusChip tone="neutral" label={`Age ${SITE_MIN_AGE}+`} />
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Active markets"
          value={`${marketCount}`}
          hint={settings.jurisdictions.join(" · ") || "None"}
        />
        <MetricCard
          label="Wholesale"
          value={settings.featureFlags.wholesaleEnabled ? "On" : "Off"}
          hint={settings.featureFlags.wholesaleEnabled ? "Applications open" : "Program paused"}
          tone={settings.featureFlags.wholesaleEnabled ? "good" : "muted"}
        />
        <MetricCard
          label="Vendor intake"
          value={settings.featureFlags.vendorOnboarding ? "On" : "Off"}
          hint="Portal reserved"
          tone={settings.featureFlags.vendorOnboarding ? "good" : "muted"}
        />
      </section>

      <p className="flex flex-wrap gap-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        <Link href="/admin/cms" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
          CMS &amp; homepage
        </Link>
        <Link href="/admin/launch" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
          Launch checklist
        </Link>
        <Link href="/admin/audit" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
          Audit log
        </Link>
      </p>

      <SiteSettingsForm settings={settings} />

      <section className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div>
            <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              Environment
            </p>
            <h2 className="mt-1 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
              Launch readiness
            </h2>
            <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
              Config review for {launch.environment}
              {blockers || warnings
                ? ` · ${blockers} blocker${blockers === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}`
                : " · no open blockers"}
            </p>
          </div>
          <Link href="/admin/launch" className="btn-outline text-[var(--scale-xs)]">
            Full checklist
          </Link>
        </header>

        <ul className="divide-y divide-[var(--color-border)]" role="list">
          {launch.checks.slice(0, 6).map((check) => (
            <li key={check.id} className="flex items-start gap-3 px-5 py-3.5 sm:px-6">
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                  check.ok
                    ? "bg-[var(--color-terp)]"
                    : check.severity === "blocker"
                      ? "bg-[var(--color-flag)]"
                      : "bg-[var(--color-resin)]"
                }`}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                  {check.id.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-[var(--scale-xs)] leading-relaxed text-[var(--color-ink-soft)]">
                  {check.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: "good" | "bad" | "neutral";
}) {
  const toneClass =
    tone === "good"
      ? "border-[var(--color-terp)]/40 text-[var(--color-terp)]"
      : tone === "bad"
        ? "border-[var(--color-flag)]/40 text-[var(--color-flag)]"
        : "border-[var(--color-border-interactive)] text-[var(--color-ink-soft)]";
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] ${toneClass}`}
    >
      {label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "good" | "muted" | "neutral";
}) {
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4">
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        {label}
      </p>
      <p
        className={`mt-2 font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.04em] ${
          tone === "good"
            ? "text-[var(--color-terp)]"
            : tone === "muted"
              ? "text-[var(--color-ink-muted)]"
              : "text-[var(--color-ink)]"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">{hint}</p>
    </div>
  );
}
