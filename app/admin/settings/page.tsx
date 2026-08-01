// app/admin/settings/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/admin/site-settings-store";
import { getLaunchStatus } from "@/lib/ops/launch-status";
import { SiteSettingsForm } from "@/components/admin/ops-admin-forms";

export const metadata: Metadata = {
  title: "Admin settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings, launch] = await Promise.all([getSiteSettings(), Promise.resolve(getLaunchStatus())]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Settings
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Site-wide ops settings. Homepage banner and layout live under{" "}
          <Link href="/admin/cms" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
            CMS
          </Link>
          .
        </p>
      </section>

      <section>
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Compliance &amp; features
        </h3>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Feature flags and launch markets. The age gate stays 21+ in code — not admin-configurable.
        </p>
        <div className="mt-4">
          <SiteSettingsForm settings={settings} />
        </div>
      </section>

      <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Launch readiness
        </h3>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Status:{" "}
          <span className={launch.readyForPublicTraffic ? "text-[var(--color-terp)]" : "text-[var(--color-flag)]"}>
            {launch.readyForPublicTraffic ? "ready" : "blocked"}
          </span>
          {launch.softLaunch ? " · soft launch" : ""}
        </p>
        <Link
          href="/admin/launch"
          className="mt-3 inline-block text-[var(--scale-sm)] text-[var(--color-resin)] underline-offset-4 hover:underline"
        >
          Open launch checklist →
        </Link>
      </section>
    </div>
  );
}
