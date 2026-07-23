// lib/affiliate/payout-types.ts
export type PayoutStatus = "pending" | "paid" | "rejected";

export type AffiliatePayout = {
  id: string;
  email: string;
  amountCents: number;
  status: PayoutStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
};

export const MIN_PAYOUT_CENTS = 5000;
