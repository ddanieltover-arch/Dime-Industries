// app/account/validate/page.tsx
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { ValidateForm } from "@/components/account/validate-form";

export const metadata: Metadata = {
  title: "Validate product",
  robots: { index: false, follow: false },
};

export default async function AccountValidatePage() {
  await requireUser();

  return (
    <div>
      <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
        Validate product
      </h2>
      <p className="mt-2 max-w-xl text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Confirm authenticity and activate the limited warranty. Until the live validation host is
        connected, codes matching catalog SKUs are accepted.
      </p>
      <div className="mt-6">
        <ValidateForm />
      </div>
    </div>
  );
}
