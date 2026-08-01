// app/cookies/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/legal/legal-document";
import { CookiePrefsForm } from "@/components/consent/cookie-prefs-form";
import { getCookieConsent } from "@/lib/consent/cookie";
import { getCurrentProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Cookie preferences",
  description: "Manage necessary, analytics, and marketing cookies for DIME Industries.",
  alternates: { canonical: "/cookies" },
};

export default async function CookiePreferencesPage() {
  const [consent, profile] = await Promise.all([getCookieConsent(), getCurrentProfile()]);

  return (
    <LegalDocument
      title="Cookie preferences"
      intro="Necessary cookies power cart, age verification, and signed-in sessions. Optional categories stay off until you enable them."
      currentHref="/cookies"
    >
      <div>
        <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
          Your choices
        </p>
        <h2 className="section-title mt-2">Manage cookies</h2>
        <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Update analytics and marketing preferences anytime. Necessary cookies cannot be turned off.
        </p>

        <div className="mt-8 border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
          <CookiePrefsForm consent={consent} />
        </div>

        {profile ? (
          <p className="mt-8 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Email notification settings live under{" "}
            <Link
              href="/account/notifications"
              className="text-[var(--color-resin)] underline-offset-4 hover:underline"
            >
              Account → Notifications
            </Link>
            .
          </p>
        ) : null}

        <p className="mt-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          See also{" "}
          <Link
            href="/legal/privacy"
            className="text-[var(--color-resin)] underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </LegalDocument>
  );
}
