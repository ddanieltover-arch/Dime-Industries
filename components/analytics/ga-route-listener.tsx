// components/analytics/ga-route-listener.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics/track";

/** Sends page_view on App Router client navigations (after consent + gtag load). */
export function GaRouteListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams?.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;
    trackPageView(path);
  }, [pathname, searchParams]);

  return null;
}
