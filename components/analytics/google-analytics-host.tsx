// components/analytics/google-analytics-host.tsx
import { Suspense } from "react";
import { getCookieConsent } from "@/lib/consent/cookie";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/ga";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GaRouteListener } from "@/components/analytics/ga-route-listener";
import { OutboundClickTracker } from "@/components/analytics/outbound-click-tracker";

/** Loads gtag only after the visitor opts into analytics cookies. */
export async function GoogleAnalyticsHost() {
  if (!GA_MEASUREMENT_ID) return null;
  const consent = await getCookieConsent();
  if (!consent.analytics) return null;
  return (
    <>
      <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
      <Suspense fallback={null}>
        <GaRouteListener />
      </Suspense>
      <OutboundClickTracker />
    </>
  );
}
