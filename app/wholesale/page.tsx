// app/wholesale/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { WholesaleApplyForm } from "@/components/wholesale/apply-form";
import { getCurrentProfile } from "@/lib/auth/session";
import { getWholesaleAccount } from "@/lib/wholesale";
import { termsLabel, WHOLESALE_DEFAULT_MOQ, WHOLESALE_MIN_ORDER_CENTS, WHOLESALE_PRICE_BPS } from "@/lib/wholesale";

export const metadata: Metadata = {
  title: "Wholesale",
  description: "Apply for DIME wholesale pricing with NET-30, NET-60, or upfront terms.",
  alternates: { canonical: "/wholesale" },
};

export default async function WholesaleLandingPage() {
  const profile = await getCurrentProfile();
  const account = profile ? await getWholesaleAccount(profile.email) : null;
  const discountPct = Math.round(100 - WHOLESALE_PRICE_BPS / 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="font-[var(--font-mono)] text-[var(--scale-xs)] uppercase tracking-wide text-[var(--color-ink-soft)]">
        B2B
      </p>
      <h1 className="mt-2 font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
        Wholesale
      </h1>
      <p className="mt-4 text-[var(--color-ink-soft)]">
        Approved accounts get ~{discountPct}% off retail, MOQ {WHOLESALE_DEFAULT_MOQ}+, and a ${
          WHOLESALE_MIN_ORDER_CENTS / 100
        }{" "}
        minimum order. Payment terms: NET-30, NET-60, or Bitcoin upfront.
      </p>

      {account ? (
        <div className="mt-8 border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] uppercase text-[var(--color-ink-soft)]">
            Your application
          </p>
          <p className="mt-2 text-[var(--color-ink)]">
            {account.businessName} · <span className="capitalize">{account.status}</span>
            {account.status === "approved"
              ? ` · default ${termsLabel(account.defaultPaymentTerms)}`
              : null}
          </p>
          {account.status === "approved" ? (
            <Link
              href="/wholesale/shop"
              className="mt-4 inline-block rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-2 text-[var(--scale-sm)] text-[var(--color-surface)]"
            >
              Open wholesale shop
            </Link>
          ) : account.status === "pending" ? (
            <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Pending admin review. You&apos;ll access the shop once approved.
            </p>
          ) : (
            <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-flag)]">
              Application was rejected. Contact wholesale@dimeindustries.us or re-apply after updates.
            </p>
          )}
        </div>
      ) : null}

      {!account || account.status === "rejected" ? (
        <div className="mt-10">
          <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
            Apply
          </h2>
          <div className="mt-4">
            <WholesaleApplyForm defaultEmail={profile?.email ?? ""} />
          </div>
          {!profile ? (
            <p className="mt-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Already applied?{" "}
              <Link href="/login?next=/wholesale" className="underline underline-offset-4">
                Sign in
              </Link>{" "}
              with the same email to see status.
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-12 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Demo: sign in with role <strong>Wholesale</strong> to preview the shop without approval.
      </p>
    </div>
  );
}
