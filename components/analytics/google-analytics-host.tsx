// components/analytics/google-analytics-host.tsx
import { getCookieConsent } from "@/lib/consent/cookie";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/ga";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

/** Loads gtag only after the visitor opts into analytics cookies. */
export async function GoogleAnalyticsHost() {
  if (!GA_MEASUREMENT_ID) return null;
  const consent = await getCookieConsent();
  if (!consent.analytics) return null;
  return <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />;
}
