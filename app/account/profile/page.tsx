// app/account/profile/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getAccountPrefs } from "@/lib/account/prefs";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function AccountProfilePage() {
  const profile = await requireUser();
  const prefs = await getAccountPrefs();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Profile
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Role: {profile.role}
          {profile.jurisdiction ? ` · Jurisdiction ${profile.jurisdiction}` : ""}
        </p>
      </section>
      <div>
        <ProfileForm
          email={profile.email}
          displayName={prefs.displayName ?? ""}
          phone={prefs.phone ?? ""}
        />
      </div>
      <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Manage{" "}
        <Link href="/account/addresses" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
          addresses
        </Link>
        ,{" "}
        <Link
          href="/account/notifications"
          className="text-[var(--color-resin)] underline-offset-4 hover:underline"
        >
          notifications
        </Link>
        , and{" "}
        <Link href="/cookies" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
          cookie preferences
        </Link>
        .
      </p>
    </div>
  );
}
