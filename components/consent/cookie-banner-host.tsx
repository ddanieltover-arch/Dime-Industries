// components/consent/cookie-banner-host.tsx
import { getCookieConsent } from "@/lib/consent/cookie";
import { CookieBanner } from "@/components/consent/cookie-banner";

export async function CookieBannerHost() {
  const consent = await getCookieConsent();
  return <CookieBanner show={!consent.decided} />;
}
