// tests/unit/locations-seo.test.ts
import { describe, expect, it } from "vitest";
import {
  getLocationState,
  LOCATION_STATES,
  locationCityNames,
} from "../../lib/locations/states";

describe("location state SEO enrichment", () => {
  it("covers every seeded market with keyword H1 + answer capsule", () => {
    expect(LOCATION_STATES.length).toBeGreaterThanOrEqual(9);
    for (const state of LOCATION_STATES) {
      expect(state.h1).toMatch(/^Find DIME in /);
      expect(state.h1).toContain(state.name);
      expect(state.answer.length).toBeGreaterThan(80);
      expect(state.cities.length).toBeGreaterThanOrEqual(2);
      expect(state.faqs.length).toBeGreaterThanOrEqual(3);
      expect(state.askFor.length).toBeGreaterThanOrEqual(2);
      expect(state.blurb.toLowerCase()).toContain(state.name.toLowerCase());
    }
  });

  it("maps California city modifiers from keyword research", () => {
    const ca = getLocationState("california");
    expect(ca).toBeTruthy();
    const cities = locationCityNames(ca!);
    expect(cities).toEqual(
      expect.arrayContaining(["Los Angeles", "Orange County", "San Diego"])
    );
    expect(ca!.purchasableOnline).toBe(true);
  });

  it("keeps MA online + Boston hub", () => {
    const ma = getLocationState("massachusetts");
    expect(ma?.purchasableOnline).toBe(true);
    expect(locationCityNames(ma!)).toContain("Boston");
  });

  it("marks retail-only states offline for checkout", () => {
    expect(getLocationState("arizona")?.purchasableOnline).toBe(false);
    expect(getLocationState("nevada")?.purchasableOnline).toBe(false);
    expect(getLocationState("nevada")?.h1).toContain("Nevada");
  });
});
