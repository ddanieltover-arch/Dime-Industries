// components/home/elevate-awards-deferred.tsx
"use client";

import dynamic from "next/dynamic";
import { ElevateAwardsStatic } from "@/components/home/elevate-awards-static";
import { LazyWhenVisible } from "@/components/home/lazy-when-visible";

const ElevateAwards = dynamic(
  () => import("@/components/home/elevate-awards").then((m) => m.ElevateAwards),
  { ssr: false, loading: () => <ElevateAwardsStatic /> },
);

/** Static first frame until near viewport, then hydrates the fade gallery. */
export function ElevateAwardsDeferred() {
  return (
    <LazyWhenVisible
      fallback={<ElevateAwardsStatic />}
      active={<ElevateAwards />}
    />
  );
}
