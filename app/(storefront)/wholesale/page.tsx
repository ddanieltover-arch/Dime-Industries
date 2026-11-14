// app/wholesale/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { WholesaleApplyForm } from "@/components/wholesale/apply-form";
import { getCurrentProfile } from "@/lib/auth/session";
import { isWholesaleEnabled } from "@/lib/admin/site-settings-store";
import { getWholesaleAccount } from "@/lib/wholesale";
import { termsLabel, WHOLESALE_DEFAULT_MOQ, WHOLESALE_MIN_ORDER_CENTS, WHOLESALE_PRICE_BPS } from "@/lib/wholesale";

export const metadata: Metadata = {
  title: "Wholesale",
  description: "Apply for DIME wholesale pricing with NET-30, NET-60, or upfront terms.",
  alternates: { canonical: "/wholesale" },
};

export default async function WholesaleLandingPage() {
  const wholesaleEnabled = await isWholesaleEnabled();
  const profile = await getCurrentProfile();
  const account = profile ? await getWholesaleAccount(profile.email) : null;
  const discountPct = Math.round(100 - WHOLESALE_PRICE_BPS / 100);

  return (
    <>
      <section className="page-header">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)]">
          <p className="section-eyebrow">B2B</p>
          <h1 className="page-header-title">Wholesale</h1>
          <p className="page-header-lede">
            Approved accounts get ~{discountPct}% off retail, MOQ {WHOLESALE_DEFAULT_MOQ}+, and a $
            {WHOLESALE_MIN_ORDER_CENTS / 100} minimum order. Payment terms: NET-30, NET-60, or Bitcoin upfront.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-[var(--section-y)]">
        {!wholesaleEnabled ? (
          <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <p className="section-eyebrow text-[var(--color-flag)]">Temporarily closed</p>
            <p className="mt-2 text-[var(--color-ink-soft)]">
              Wholesale applications and ordering are paused. Contact{" "}
              <a href="mailto:sales@dimeindustries.us" className="prose-link">
                sales@dimeindustries.us
              </a>{" "}
              if you need help with an existing account.
            </p>
            {account?.status === "approved" ? (
              <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-muted)]">
                Your account ({account.businessName}) remains on file; shop access resumes when wholesale reopens.
              </p>
            ) : null}
          </div>
        ) : (
          <>
            {account ? (
              <div className="bg-[var(--color-surface)] p-6">
                <p className="section-eyebrow">Your application</p>
                <p className="mt-2 text-[var(--color-ink)]">
                  {account.businessName} · <span className="capitalize">{account.status}</span>
                  {account.status === "approved"
                    ? ` · default ${termsLabel(account.defaultPaymentTerms)}`
                    : null}
                </p>
                {account.status === "approved" ? (
                  <Link href="/wholesale/shop" className="btn-primary mt-5">
                    Open wholesale shop
                  </Link>
                ) : account.status === "pending" ? (
                  <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                    Pending admin review. You&apos;ll access the shop once approved.
                  </p>
                ) : (
                  <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-flag)]">
                    Application was rejected. Contact sales@dimeindustries.us or re-apply after updates.
                  </p>
                )}
              </div>
            ) : null}

            {!account || account.status === "rejected" ? (
              <div className="mt-10">
                <h2 className="section-eyebrow">Apply</h2>
                <div className="mt-4">
                  <WholesaleApplyForm defaultEmail={profile?.email ?? ""} />
                </div>
                {!profile ? (
                  <p className="mt-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                    Already applied?{" "}
                    <Link href="/login?next=/wholesale" className="prose-link">
                      Sign in
                    </Link>{" "}
                    with the same email to see status.
                  </p>
                ) : null}
              </div>
            ) : null}

            <p className="mt-12 text-[var(--scale-sm)] text-[var(--color-ink-muted)]">
              Demo: sign in with role <strong className="text-[var(--color-ink-soft)]">Wholesale</strong> to preview the
              shop without approval.
            </p>
          </>
        )}
      </div>
    </>
  );
}