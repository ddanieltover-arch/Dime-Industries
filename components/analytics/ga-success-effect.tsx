// components/analytics/ga-success-effect.tsx
"use client";

import { useEffect, useRef } from "react";

/** Runs `onSuccess` once when `ready` flips true (form success states). */
export function GaSuccessEffect({
  ready,
  onSuccess,
}: {
  ready: boolean;
  onSuccess: () => void;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (!ready || sent.current) return;
    sent.current = true;
    onSuccess();
  }, [ready, onSuccess]);

  return null;
}
