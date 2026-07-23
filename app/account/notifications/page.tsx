// app/account/notifications/page.tsx
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getAccountPrefs } from "@/lib/account/prefs";
import { NotificationsForm } from "@/components/account/notifications-form";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default async function AccountNotificationsPage() {
  await requireUser();
  const prefs = await getAccountPrefs();

  return (
    <div>
      <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
        Notifications
      </h2>
      <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Choose which emails you want from DIME.
      </p>
      <div className="mt-6">
        <NotificationsForm {...prefs.notifications} />
      </div>
    </div>
  );
}
