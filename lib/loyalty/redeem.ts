// lib/loyalty/redeem.ts
import { REDEEM_POINTS_PER_DOLLAR } from "./constants";

export const LOYALTY_REDEEM_COOKIE = "dime_loyalty_redeem";
export const MIN_REDEEM_POINTS = 100; // $1 minimum
export const MAX_REDEEM_FRACTION_BPS = 5000; // up to 50% of subtotal

export function pointsToDiscountCents(points: number): number {
  if (points <= 0) return 0;
  return Math.floor(points / REDEEM_POINTS_PER_DOLLAR) * 100;
}

export function discountCentsToPoints(cents: number): number {
  if (cents <= 0) return 0;
  return Math.floor(cents / 100) * REDEEM_POINTS_PER_DOLLAR;
}

/**
 * Clamp requested redeem points to balance, min redeem, and max % of subtotal.
 */
export function clampRedeemPoints(input: {
  requestedPoints: number;
  balance: number;
  subtotalCents: number;
}): { points: number; discountCents: number } {
  const maxBySubtotal = discountCentsToPoints(
    Math.floor((input.subtotalCents * MAX_REDEEM_FRACTION_BPS) / 10000)
  );
  let points = Math.max(0, Math.floor(input.requestedPoints));
  points = Math.min(points, input.balance, maxBySubtotal);
  // Snap to whole dollars of redeem value
  points = Math.floor(points / REDEEM_POINTS_PER_DOLLAR) * REDEEM_POINTS_PER_DOLLAR;
  if (points > 0 && points < MIN_REDEEM_POINTS) points = 0;
  return { points, discountCents: pointsToDiscountCents(points) };
}
