// components/analytics/purchase-event.tsx
"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/analytics/track";

type Props = {
  transactionId: string;
  valueUsd: number;
  paid: boolean;
};

/** Fires once per page load when payment is confirmed. */
export function PurchaseEvent({ transactionId, valueUsd, paid }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (!paid || sent.current || valueUsd < 0) return;
    sent.current = true;
    trackPurchase({ transactionId, valueUsd });
  }, [paid, transactionId, valueUsd]);

  return null;
}
