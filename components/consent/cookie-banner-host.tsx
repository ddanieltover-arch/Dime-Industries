// components/consent/cookie-banner-host.tsx
/**
 * Cookie banner host — disabled (owner request 2026-08-07).
 * Not mounted from `app/layout.tsx` while disabled (chrome #8).
 * Consent store + `/cookies` preferences remain.
 * Restore: render `<CookieBannerHost />` next to `<PwaHost />` in root layout.
 */
export async function CookieBannerHost() {
  return null;
}
