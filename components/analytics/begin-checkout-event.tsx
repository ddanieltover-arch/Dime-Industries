// components/analytics/begin-checkout-event.tsx
"use client";

import { useEffect } from "react";
import { trackBeginCheckout } from "@/lib/analytics/track";

type Props = {
  valueUsd: number;
};

export function BeginCheckoutEvent({ valueUsd }: Props) {
  useEffect(() => {
    if (valueUsd <= 0) return;
    trackBeginCheckout(valueUsd);
  }, [valueUsd]);

  return null;
}
