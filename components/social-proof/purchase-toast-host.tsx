// components/social-proof/purchase-toast-host.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { SocialProofProduct } from "@/lib/social-proof/purchase-notifications";

const PurchaseToastClient = dynamic(
  () =>
    import("@/components/social-proof/purchase-toast-client").then(
      (m) => m.PurchaseToastClient,
    ),
  { ssr: false },
);

/**
 * Defers purchase social-proof until the browser is idle so it stays off the
 * critical hydration path (same pattern as `PwaHost`).
 */
export function PurchaseToastHost({
  products,
}: {
  products: SocialProofProduct[];
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (products.length === 0) return;

    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const arm = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(arm, { timeout: 5000 });
    } else {
      timeoutId = setTimeout(arm, 3000);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [products.length]);

  if (!ready || products.length === 0) return null;
  return <PurchaseToastClient products={products} />;
}
