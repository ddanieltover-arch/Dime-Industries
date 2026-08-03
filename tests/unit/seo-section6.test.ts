// tests/unit/seo-section6.test.ts
import { describe, expect, it } from "vitest";
import {
  BRAND_LOCAL_CONTACT,
  CITY_GEO,
  geoForCity,
  geoForState,
  mapsRetailerSearchUrl,
  osmEmbedUrl,
} from "../../lib/locations/geo";
import { LOCATION_STATES } from "../../lib/locations/states";
import {
  buildLocationStateJsonLd,
  buildLocationsHubJsonLd,
} from "../../lib/seo/json-ld";
import { SECURITY_HEADERS } from "../../lib/security/headers";
import { SITE_URL } from "../../lib/seo/site";

describe("Section 6 — local geo helpers", () => {
  it("resolves CA city centroids", () => {
    expect(geoForCity("Los Angeles")).toEqual(CITY_GEO["los-angeles"]);
    expect(geoForCity("Orange County")?.lat).toBeCloseTo(33.7175, 3);
    expect(geoForState("california")).toBeTruthy();
  });

  it("builds Maps retailer search and OSM embed URLs", () => {
    const maps = mapsRetailerSearchUrl("Los Angeles, California");
    expect(maps).toContain("google.com/maps/search");
    expect(maps).toContain("licensed");
    const embed = osmEmbedUrl({ lat: 34.05, lng: -118.24 });
    expect(embed).toContain("openstreetmap.org/export/embed");
    expect(embed).toContain("34.05");
  });

  it("exposes brand contact without inventing street NAP", () => {
    expect(BRAND_LOCAL_CONTACT.name).toBe("DIME Industries");
    expect(BRAND_LOCAL_CONTACT.email).toContain("@");
    expect(BRAND_LOCAL_CONTACT).not.toHaveProperty("streetAddress");
    expect(BRAND_LOCAL_CONTACT).not.toHaveProperty("telephone");
  });
});

describe("Section 6 — local schema", () => {
  it("builds state Place graph with city geo and OnlineStore for CA", () => {
    const ca = LOCATION_STATES.find((s) => s.slug === "california")!;
    const la = geoForCity("Los Angeles")!;
    const json = buildLocationStateJsonLd({
      slug: ca.slug,
      name: ca.name,
      code: ca.code,
      blurb: ca.blurb,
      purchasableOnline: true,
      stateLat: 36.7783,
      stateLng: -119.4179,
      cities: [{ name: "Los Angeles", lat: la.lat, lng: la.lng }],
    });
    expect(json["@graph"]).toBeTruthy();
    const graph = json["@graph"] as Record<string, unknown>[];
    expect(graph.some((n) => n["@type"] === "Place")).toBe(true);
    expect(graph.some((n) => n["@type"] === "OnlineStore")).toBe(true);
    expect(graph.some((n) => n["@type"] === "LocalBusiness")).toBe(false);
    expect(JSON.stringify(graph)).toContain("Los Angeles");
  });

  it("builds locations hub ItemList for all markets", () => {
    const json = buildLocationsHubJsonLd(
      LOCATION_STATES.map((s) => ({ name: s.name, slug: s.slug }))
    );
    expect(json["@type"]).toBe("ItemList");
    expect(json.itemListElement).toHaveLength(LOCATION_STATES.length);
    expect((json.itemListElement as Record<string, unknown>[])[0]).toMatchObject({
      position: 1,
      url: `${SITE_URL}/locations/${LOCATION_STATES[0]!.slug}`,
    });
  });
});

describe("Section 6 — CSP for map embeds", () => {
  it("allows OpenStreetMap frames", () => {
    const csp = SECURITY_HEADERS.find((h) => h.key === "Content-Security-Policy")?.value ?? "";
    expect(csp).toContain("frame-src");
    expect(csp).toContain("https://www.openstreetmap.org");
  });
});
