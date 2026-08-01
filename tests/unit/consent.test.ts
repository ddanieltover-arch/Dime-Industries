import { describe, expect, it } from "vitest";
import {
  acceptAllConsent,
  normalizeCookieConsent,
  rejectOptionalConsent,
  saveCustomConsent,
} from "@/lib/consent/logic";

describe("cookie consent", () => {
  it("defaults undecided with optional off", () => {
    const c = normalizeCookieConsent(null);
    expect(c.necessary).toBe(true);
    expect(c.analytics).toBe(false);
    expect(c.marketing).toBe(false);
    expect(c.decided).toBe(false);
  });

  it("accept all enables optional categories", () => {
    const c = acceptAllConsent(new Date("2026-08-01T00:00:00.000Z"));
    expect(c.analytics).toBe(true);
    expect(c.marketing).toBe(true);
    expect(c.decided).toBe(true);
  });

  it("reject optional keeps necessary only", () => {
    const c = rejectOptionalConsent();
    expect(c.necessary).toBe(true);
    expect(c.analytics).toBe(false);
    expect(c.marketing).toBe(false);
    expect(c.decided).toBe(true);
  });

  it("custom save marks decided", () => {
    const c = saveCustomConsent({ analytics: true, marketing: false });
    expect(c.analytics).toBe(true);
    expect(c.marketing).toBe(false);
    expect(c.decided).toBe(true);
  });
});
