// lib/consent/logic.ts — pure cookie-consent helpers
export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  /** false until the visitor has made a choice (banner still shown) */
  decided: boolean;
};

export const DEFAULT_COOKIE_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date(0).toISOString(),
  decided: false,
};

export function normalizeCookieConsent(input: unknown): CookieConsent {
  if (!input || typeof input !== "object") return { ...DEFAULT_COOKIE_CONSENT };
  const v = input as Record<string, unknown>;
  return {
    necessary: true,
    analytics: Boolean(v.analytics),
    marketing: Boolean(v.marketing),
    updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : new Date(0).toISOString(),
    decided: Boolean(v.decided),
  };
}

export function acceptAllConsent(now = new Date()): CookieConsent {
  return {
    necessary: true,
    analytics: true,
    marketing: true,
    updatedAt: now.toISOString(),
    decided: true,
  };
}

export function rejectOptionalConsent(now = new Date()): CookieConsent {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    updatedAt: now.toISOString(),
    decided: true,
  };
}

export function saveCustomConsent(
  partial: { analytics: boolean; marketing: boolean },
  now = new Date()
): CookieConsent {
  return {
    necessary: true,
    analytics: partial.analytics,
    marketing: partial.marketing,
    updatedAt: now.toISOString(),
    decided: true,
  };
}
