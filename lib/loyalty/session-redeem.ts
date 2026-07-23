// lib/loyalty/session-redeem.ts
import "server-only";
import { cookies } from "next/headers";
import { LOYALTY_REDEEM_COOKIE, clampRedeemPoints } from "./redeem";
import { getLoyaltyAccount } from "./store";

export async function getRequestedRedeemPoints(): Promise<number> {
  const store = await cookies();
  const raw = store.get(LOYALTY_REDEEM_COOKIE)?.value;
  const n = Number(raw ?? 0);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export async function setRequestedRedeemPoints(points: number): Promise<void> {
  const store = await cookies();
  const value = Math.max(0, Math.floor(points));
  if (value <= 0) {
    store.set(LOYALTY_REDEEM_COOKIE, "", { path: "/", maxAge: 0 });
    return;
  }
  store.set(LOYALTY_REDEEM_COOKIE, String(value), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function resolveLoyaltyRedeem(input: {
  email: string | null | undefined;
  subtotalAfterCouponCents: number;
}): Promise<{ points: number; discountCents: number }> {
  if (!input.email) return { points: 0, discountCents: 0 };
  const requested = await getRequestedRedeemPoints();
  if (requested <= 0) return { points: 0, discountCents: 0 };
  const account = await getLoyaltyAccount(input.email);
  return clampRedeemPoints({
    requestedPoints: requested,
    balance: account.pointsBalance,
    subtotalCents: input.subtotalAfterCouponCents,
  });
}
