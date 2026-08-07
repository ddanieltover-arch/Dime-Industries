// components/analytics/analytics-when-consented.tsx
import { getCookieConsent } from "@/lib/consent/cookie";

/**
 * Server gate — keeps GA event islands out of the client tree until the
 * visitor has opted into analytics cookies (`dime_consent`).
 */
export async function AnalyticsWhenConsented({
  children,
}: {
  children: React.ReactNode;
}) {
  const consent = await getCookieConsent();
  if (!consent.analytics) return null;
  return <>{children}</>;
}
