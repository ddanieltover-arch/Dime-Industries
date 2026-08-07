// components/social-proof/purchase-toast-client.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { PurchaseToast } from "@/components/social-proof/purchase-toast";
import {
  PURCHASE_TOAST_INTERVAL_MS,
  PURCHASE_TOAST_VISIBLE_MS,
  createPurchaseNotification,
  dismissPurchaseToast,
  isPurchaseToastDismissed,
  type PurchaseNotification,
  type SocialProofProduct,
} from "@/lib/social-proof/purchase-notifications";

export function PurchaseToastClient({
  products,
}: {
  products: SocialProofProduct[];
}) {
  const [enabled, setEnabled] = useState(false);
  const [notification, setNotification] = useState<PurchaseNotification | null>(
    null,
  );
  const [visible, setVisible] = useState(false);
  const lastSlugRef = useRef<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPurchaseToastDismissed(window.sessionStorage)) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || products.length === 0) return;

    const showNext = () => {
      const next = createPurchaseNotification(products, lastSlugRef.current);
      if (!next) return;
      lastSlugRef.current = next.product.slug;
      setNotification(next);
      // Next frame so enter transition runs after mount/update.
      requestAnimationFrame(() => setVisible(true));

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, PURCHASE_TOAST_VISIBLE_MS);
    };

    // First toast shortly after idle mount, then every 10s thereafter.
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const initial = setTimeout(() => {
      showNext();
      intervalId = setInterval(showNext, PURCHASE_TOAST_INTERVAL_MS);
    }, 1200);

    return () => {
      clearTimeout(initial);
      if (intervalId) clearInterval(intervalId);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [enabled, products]);

  if (!enabled || !notification) return null;

  return (
    <PurchaseToast
      notification={notification}
      visible={visible}
      onDismiss={() => {
        dismissPurchaseToast(window.sessionStorage);
        setVisible(false);
        setEnabled(false);
        setNotification(null);
      }}
    />
  );
}
