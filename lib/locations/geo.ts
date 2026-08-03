// lib/locations/geo.ts — city centroids + map helpers for local SEO (no storefront NAP)
export type GeoPoint = { lat: number; lng: number };

/** Approximate city / metro centroids for Place schema + map embeds. */
export const CITY_GEO: Record<string, GeoPoint> = {
  "los-angeles": { lat: 34.0522, lng: -118.2437 },
  "orange-county": { lat: 33.7175, lng: -117.8311 },
  "san-diego": { lat: 32.7157, lng: -117.1611 },
  "bay-area": { lat: 37.7749, lng: -122.4194 },
  boston: { lat: 42.3601, lng: -71.0589 },
  cambridge: { lat: 42.3736, lng: -71.1097 },
  worcester: { lat: 42.2626, lng: -71.8023 },
  phoenix: { lat: 33.4484, lng: -112.074 },
  scottsdale: { lat: 33.4942, lng: -111.9261 },
  tucson: { lat: 32.2226, lng: -110.9747 },
  billings: { lat: 45.7833, lng: -108.5007 },
  missoula: { lat: 46.8721, lng: -113.994 },
  bozeman: { lat: 45.677, lng: -111.0429 },
  "las-vegas": { lat: 36.1699, lng: -115.1398 },
  henderson: { lat: 36.0395, lng: -114.9817 },
  reno: { lat: 39.5296, lng: -119.8138 },
  newark: { lat: 40.7357, lng: -74.1724 },
  "jersey-city": { lat: 40.7178, lng: -74.0431 },
  "atlantic-city": { lat: 39.3643, lng: -74.4229 },
  albuquerque: { lat: 35.0844, lng: -106.6504 },
  "santa-fe": { lat: 35.687, lng: -105.9378 },
  "las-cruces": { lat: 32.3199, lng: -106.7637 },
  "new-york-city": { lat: 40.7128, lng: -74.006 },
  buffalo: { lat: 42.8864, lng: -78.8784 },
  albany: { lat: 42.6526, lng: -73.7562 },
  "oklahoma-city": { lat: 35.4676, lng: -97.5164 },
  tulsa: { lat: 36.154, lng: -95.9928 },
  norman: { lat: 35.2226, lng: -97.4395 },
};

export const STATE_GEO: Record<string, GeoPoint> = {
  california: { lat: 36.7783, lng: -119.4179 },
  massachusetts: { lat: 42.4072, lng: -71.3824 },
  arizona: { lat: 34.0489, lng: -111.0937 },
  montana: { lat: 46.8797, lng: -110.3626 },
  nevada: { lat: 38.8026, lng: -116.4194 },
  "new-jersey": { lat: 40.0583, lng: -74.4057 },
  "new-mexico": { lat: 34.5199, lng: -105.8701 },
  "new-york": { lat: 43.2994, lng: -74.2179 },
  oklahoma: { lat: 35.4676, lng: -97.5164 },
};

export function cityGeoSlug(cityName: string): string {
  return cityName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function geoForCity(cityName: string): GeoPoint | null {
  return CITY_GEO[cityGeoSlug(cityName)] ?? null;
}

export function geoForState(stateSlug: string): GeoPoint | null {
  return STATE_GEO[stateSlug] ?? null;
}

/** Google Maps search — find licensed retailers near a place (not a claimed DIME storefront). */
export function mapsRetailerSearchUrl(placeLabel: string): string {
  const q = `licensed cannabis dispensary near ${placeLabel}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** OpenStreetMap embed for a city centroid (no API key). */
export function osmEmbedUrl(point: GeoPoint, delta = 0.12): string {
  const { lat, lng } = point;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

/**
 * Brand contact signals for local SEO / citations.
 * Street address + public phone are owner-owned (GBP) — do not invent NAP.
 */
export const BRAND_LOCAL_CONTACT = {
  name: "DIME Industries",
  email: "sales@dimeindustries.us",
  /** HQ region often cited in press — not a consumer storefront address */
  headquartersRegion: "Orange County, California",
  sameAs: [
    "https://dimeindustries.com",
    "https://www.instagram.com/dime.industries/",
    "https://www.facebook.com/DimeIndustriesCo",
    "https://www.linkedin.com/company/dime-industries",
  ],
} as const;
