// components/pwa/pwa-host.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PwaClient = dynamic(
  () => import("@/components/pwa/pwa-client").then((m) => m.PwaClient),
  { ssr: false },
);

/**
 * Defers PWA SW registration + install UI until the browser is idle so it
 * stays off the critical hydration path.
 */
export function PwaHost() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const arm = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(arm, { timeout: 4000 });
    } else {
      timeoutId = setTimeout(arm, 2500);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;
  return <PwaClient />;
}
