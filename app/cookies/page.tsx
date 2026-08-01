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

const CATEGORIES = [
  {
    title: "Necessary",
    body: "Always on. Powers cart, age verification, consent records, security, and signed-in sessions. The Site cannot operate correctly without them.",
  },
  {
    title: "Analytics",
    body: "Optional. Helps us understand storefront performance, errors, and traffic patterns so we can improve checkout and browsing. Off until you enable it.",
  },
  {
    title: "Marketing",
    body: "Optional. Supports personalized offers and campaign measurement when you opt in. Off until you enable it — never used to bypass age or jurisdiction rules.",
  },
] as const;

export default async function CookiePreferencesPage() {
  const [consent, profile] = await Promise.all([getCookieConsent(), getCurrentProfile()]);

  return (
    <LegalDocument
      title="Cookie preferences"
      intro="Necessary cookies power cart, age verification, and signed-in sessions. Optional analytics and marketing stay off until you enable them."
      currentHref="/cookies"
    >
      <div className="space-y-12">
        <div>
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Overview
          </p>
          <h2 className="section-title mt-2">How we use cookies</h2>
          <p className="mt-4 text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
            Cookies and similar technologies store small pieces of data in your browser. We use them to keep you
            signed in, remember age and jurisdiction checks, save cart contents, and — only with consent — measure
            performance or marketing. Details on personal data live in the{" "}
            <Link
              href="/legal/privacy"
              className="text-[var(--color-resin)] underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div>
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Categories
          </p>
          <h2 className="section-title mt-2">What each category covers</h2>
          <ul className="mt-8 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {CATEGORIES.map((cat) => (
              <li key={cat.title} className="bg-[var(--color-surface)] p-6">
                <h3 className="font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {cat.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">{cat.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Your choices
          </p>
          <h2 className="section-title mt-2">Manage cookies</h2>
          <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Update analytics and marketing preferences anytime. Necessary cookies cannot be turned off. Saving
            updates the dime_consent record used across this Site.
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
        </div>

        <div>
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Related
          </p>
          <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
            See also the{" "}
            <Link
              href="/legal/privacy"
              className="text-[var(--color-resin)] underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            ,{" "}
            <Link
              href="/legal/terms"
              className="text-[var(--color-resin)] underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>
            , and{" "}
            <Link href="/contact" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
              Contact
            </Link>{" "}
            for privacy@dimeindustries.us data requests.
          </p>
        </div>
      </div>
    </LegalDocument>
  );
}
