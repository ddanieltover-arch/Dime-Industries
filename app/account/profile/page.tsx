// app/account/profile/page.tsx
import type { Metadata } from "next";
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
    <div>
      <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
        Profile
      </h2>
      <div className="mt-6">
        <ProfileForm
          email={profile.email}
          displayName={prefs.displayName ?? ""}
          phone={prefs.phone ?? ""}
        />
      </div>
    </div>
  );
}
