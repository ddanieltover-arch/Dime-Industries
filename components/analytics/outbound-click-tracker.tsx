// components/analytics/outbound-click-tracker.tsx
"use client";

import { useEffect } from "react";
import { trackClick } from "@/lib/analytics/track";

function isOutbound(href: string): boolean {
  try {
    const url = new URL(href, window.location.origin);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/** Captures mailto / tel / outbound link clicks for the `click` conversion event. */
export function OutboundClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.href;
      if (!href) return;
      const isMailOrTel =
        href.startsWith("mailto:") || href.startsWith("tel:");
      const outbound = isMailOrTel || isOutbound(href);
      if (!outbound) return;
      trackClick({
        linkUrl: href,
        linkText: (anchor.textContent || "").trim().slice(0, 120) || undefined,
        outbound: true,
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
