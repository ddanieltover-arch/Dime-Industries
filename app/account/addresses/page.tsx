// app/account/addresses/page.tsx
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getAccountPrefs } from "@/lib/account/prefs";
import { AddressesPanel } from "@/components/account/addresses-panel";

export const metadata: Metadata = {
  title: "Addresses",
  robots: { index: false, follow: false },
};

export default async function AccountAddressesPage() {
  await requireUser();
  const prefs = await getAccountPrefs();

  return (
    <div>
      <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
        Addresses
      </h2>
      <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Saved shipping addresses for faster checkout.
      </p>
      <div className="mt-6">
        <AddressesPanel addresses={prefs.addresses} />
      </div>
    </div>
  );
}
