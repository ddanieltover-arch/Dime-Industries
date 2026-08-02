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
    <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-14 lg:py-16">
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
        B2B
      </p>
      <h1 className="section-title mt-2">Wholesale</h1>
      <p className="mt-4 text-[var(--color-ink-soft)]">
        Approved accounts get ~{discountPct}% off retail, MOQ {WHOLESALE_DEFAULT_MOQ}+, and a $
        {WHOLESALE_MIN_ORDER_CENTS / 100} minimum order. Payment terms: NET-30, NET-60, or Bitcoin upfront.
      </p>

      {!wholesaleEnabled ? (
        <div className="mt-8 border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-flag)]">
            Temporarily closed
          </p>
          <p className="mt-2 text-[var(--color-ink-soft)]">
            Wholesale applications and ordering are paused. Contact{" "}
            <a href="mailto:sales@dimeindustries.us" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
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
            <div className="mt-8 bg-[var(--color-surface)] p-6">
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                Your application
              </p>
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
              <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                Apply
              </h2>
              <div className="mt-4">
                <WholesaleApplyForm defaultEmail={profile?.email ?? ""} />
              </div>
              {!profile ? (
                <p className="mt-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  Already applied?{" "}
                  <Link href="/login?next=/wholesale" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
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
  );
}
