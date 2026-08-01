// lib/consent/cookie.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  DEFAULT_COOKIE_CONSENT,
  normalizeCookieConsent,
  type CookieConsent,
} from "./logic";

export const CONSENT_COOKIE = "dime_consent";

const consentSchema = z.object({
  necessary: z.literal(true),
  analytics: z.boolean(),
  marketing: z.boolean(),
  updatedAt: z.string(),
  decided: z.boolean(),
});

export async function getCookieConsent(): Promise<CookieConsent> {
  const store = await cookies();
  const raw = store.get(CONSENT_COOKIE)?.value;
  if (!raw) return { ...DEFAULT_COOKIE_CONSENT };
  try {
    const parsed = consentSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data : normalizeCookieConsent(JSON.parse(decodeURIComponent(raw)));
  } catch {
    return { ...DEFAULT_COOKIE_CONSENT };
  }
}

export async function saveCookieConsent(consent: CookieConsent): Promise<void> {
  const next = normalizeCookieConsent({ ...consent, necessary: true, decided: true });
  const store = await cookies();
  store.set(CONSENT_COOKIE, encodeURIComponent(JSON.stringify(next)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export type { CookieConsent };
