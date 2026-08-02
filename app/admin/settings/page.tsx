// app/admin/settings/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/admin/site-settings-store";
import { getLaunchStatus } from "@/lib/ops/launch-status";
import { SITE_MIN_AGE } from "@/lib/compliance/jurisdictions";
import { SiteSettingsForm } from "@/components/admin/site-settings-panel";

export const metadata: Metadata = {
  title: "Admin settings",
  robots: { index: false, follow: false },
};

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "markets", label: "Markets" },
  { id: "capabilities", label: "Capabilities" },
  { id: "readiness", label: "Readiness" },
] as const;

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings, launch] = await Promise.all([getSiteSettings(), Promise.resolve(getLaunchStatus())]);

  const marketCount = settings.jurisdictions.length;
  const blockers = launch.checks.filter((c) => !c.ok && c.severity === "blocker").length;
  const warnings = launch.checks.filter((c) => !c.ok && c.severity === "warning").length;

  return (
    <div className="space-y-8">
      {/* Page intro */}
      <header className="relative overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in srgb, var(--color-resin) 22%, transparent), transparent 55%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Operations
            </p>
            <h2 className="mt-2 font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.04em] text-[var(--color-ink)]">
              Settings
            </h2>
            <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
              Control launch markets, program flags, and readiness from one console. Content and homepage
              layout stay under CMS.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusChip
              tone={launch.readyForPublicTraffic ? "good" : "bad"}
              label={launch.readyForPublicTraffic ? "Launch ready" : "Launch blocked"}
            />
            {launch.softLaunch ? <StatusChip tone="neutral" label="Soft launch" /> : null}
            <StatusChip tone="neutral" label={`Age ${SITE_MIN_AGE}+`} />
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        {/* Side rail */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav aria-label="Settings sections" className="space-y-1">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block border-l-2 border-transparent px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)] transition hover:border-[var(--color-resin)]/50 hover:text-[var(--color-ink)]"
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="mt-8 space-y-2 border-t border-[var(--color-border)] pt-6">
            <p className="px-3 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
              Related
            </p>
            <RelatedLink href="/admin/cms" label="CMS & homepage" />
            <RelatedLink href="/admin/launch" label="Launch checklist" />
            <RelatedLink href="/admin/audit" label="Audit log" />
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0 space-y-8">
          <section id="overview" className="scroll-mt-8">
            <div className="grid gap-3 sm:grid-cols-3">
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
            </div>
          </section>

      <section id="markets" className="scroll-mt-8">
        <div className="mb-3">
          <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
            Configuration
          </p>
        </div>
        <SiteSettingsForm settings={settings} />
      </section>

          <section id="readiness" className="scroll-mt-8 overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
            <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
              <div>
                <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                  Environment
                </p>
                <h3 className="mt-1 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
                  Launch readiness
                </h3>
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
      </div>
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

function RelatedLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 transition hover:text-[var(--color-ink)] hover:underline"
    >
      {label}
    </Link>
  );
}
