// app/account/notifications/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getAccountPrefs } from "@/lib/account/prefs";
import { getCookieConsent } from "@/lib/consent/cookie";
import { NotificationsForm } from "@/components/account/notifications-form";
import { CookiePrefsForm } from "@/components/consent/cookie-prefs-form";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default async function AccountNotificationsPage() {
  await requireUser();
  const [prefs, consent] = await Promise.all([getAccountPrefs(), getCookieConsent()]);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Notifications
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Choose which emails you want from DIME.
        </p>
        <div className="mt-6">
          <NotificationsForm {...prefs.notifications} />
        </div>
      </section>

      <section id="cookies">
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Cookie preferences
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Same controls as the sitewide banner and{" "}
          <Link href="/cookies" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
            /cookies
          </Link>
          .
        </p>
        <div className="mt-6">
          <CookiePrefsForm consent={consent} />
        </div>
      </section>
    </div>
  );
}
