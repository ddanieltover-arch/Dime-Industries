// components/product/loyalty-earn-callout.tsx
import Link from "next/link";
import { POINTS_PER_DOLLAR, REDEEM_POINTS_PER_DOLLAR } from "@/lib/loyalty/constants";

export function LoyaltyEarnCallout({
  priceCents,
  signedIn,
}: {
  priceCents: number;
  signedIn?: boolean;
}) {
  const earnPts = Math.floor(priceCents / 100) * POINTS_PER_DOLLAR;

  return (
    <aside className="border border-[var(--color-border)] bg-[var(--color-bg)] p-4" aria-label="Loyalty rewards">
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
        Rewards
      </p>
      <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink)]">
        Earn <span className="text-[var(--color-resin)]">~{earnPts} pts</span> on this purchase
        <span className="text-[var(--color-ink-soft)]">
          {" "}
          ({POINTS_PER_DOLLAR} pt / $1 · {REDEEM_POINTS_PER_DOLLAR} pts = $1 off)
        </span>
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        <Link
          href={signedIn ? "/account/loyalty" : "/rewards"}
          className="nav-link text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
        >
          {signedIn ? "View my points" : "Learn about Rewards"}
        </Link>
        {!signedIn ? (
          <Link href="/signup" className="nav-link text-[var(--color-ink-soft)] hover:text-[var(--color-resin)]">
            Create account
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
