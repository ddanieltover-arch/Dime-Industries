/**
 * scripts/import-brand-catalog.mjs
 *
 * Scrapes product leaf URLs from dimeindustries.com sitemap, extracts
 * title/description/image, downloads images, writes
 * lib/catalog/brand-catalog.generated.ts
 *
 * PLACEHOLDER_PRICING — replace with owner price sheet before go-live.
 *
 * Usage: node scripts/import-brand-catalog.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_TS = path.join(ROOT, "lib", "catalog", "brand-catalog.generated.ts");
const IMG_ROOT = path.join(ROOT, "public", "catalog");

const SITEMAP = "https://dimeindustries.com/sitemap-1.xml";

/** @type {Record<string, number>} */
const PRICE_BANDS = {
  signature: 3500,
  "live-reserve": 4500,
  balanced: 4000,
  rosin: 5500,
  "state-exclusive": 4500,
  collabs: 5000,
  gummies: 2500,
  softgels: 3000,
  prerolls: 2000,
  accessories: 2999,
  default: 3999,
};

/** @type {Record<string, { thc: number; cbd: number }>} */
const POTENCY_BANDS = {
  signature: { thc: 78, cbd: 0.2 },
  "live-reserve": { thc: 82, cbd: 0.2 },
  balanced: { thc: 55, cbd: 12 },
  rosin: { thc: 75, cbd: 0.3 },
  "state-exclusive": { thc: 80, cbd: 0.2 },
  collabs: { thc: 79, cbd: 0.2 },
  gummies: { thc: 10, cbd: 0 },
  softgels: { thc: 10, cbd: 5 },
  prerolls: { thc: 28, cbd: 0.5 },
  accessories: { thc: 0, cbd: 0 },
  default: { thc: 70, cbd: 0.2 },
};

const LINE_FROM_PATH = {
  "signature-line": { slug: "signature", name: "Signature" },
  "live-reserve-line": { slug: "live-reserve", name: "Live Reserve" },
  "balanced-line": { slug: "balanced", name: "Balanced" },
  "rosin-line": { slug: "rosin", name: "Rosin" },
  "state-exclusive": { slug: "state-exclusive", name: "State Exclusive" },
  collaborations: { slug: "collabs", name: "Collabs" },
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "DIME-Enterprise-Catalog-Import/1.0" },
  });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

function meta(html, prop) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
    "i"
  );
  return (html.match(re)?.[1] || html.match(re2)?.[1] || "").replace(/&amp;/g, "&").trim();
}

function titleTag(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return (m?.[1] || "").replace(/\s*\|\s*Dime.*$/i, "").trim();
}

function decodeHtml(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function classify(pathname) {
  // /products/vapes/signature-line/banana-punch
  const parts = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  // products, category, ...
  if (parts[0] !== "products" || parts.length < 3) return null;

  const leaf = parts[parts.length - 1];
  // Skip category/line landing pages (no product leaf depth)
  const productDepthOk =
    (parts[1] === "vapes" && parts.length === 4) ||
    (parts[1] === "gummies" && parts.length === 4) ||
    (parts[1] === "softgels" && parts.length === 3) ||
    (parts[1] === "accessories" && parts.length === 3) ||
    (parts[1] === "prerolls" && parts.length >= 3);

  if (!productDepthOk) return null;

  let categorySlug = "vapes";
  let categoryName = "Vapes";
  let lineSlug = null;
  let lineName = null;
  let priceKey = "default";
  let format = "1g";
  let strainType = "hybrid";
  let jurisdictions = ["CA", "MA"];

  if (parts[1] === "vapes") {
    categorySlug = "vapes";
    categoryName = "Vapes";
    const lineKey = parts[2];
    const line = LINE_FROM_PATH[lineKey];
    if (!line) return null;
    lineSlug = line.slug;
    lineName = line.name;
    priceKey = line.slug;
    format = "1g cartridge";
    if (line.slug === "state-exclusive") {
      // Informational multi-state; purchasable in CA/MA for now
      jurisdictions = ["CA", "MA"];
    }
  } else if (parts[1] === "gummies") {
    categorySlug = "edibles";
    categoryName = "Edibles";
    const sub = parts[2]; // balanced | rosin
    lineSlug = sub === "rosin" ? "rosin" : "balanced";
    lineName = sub === "rosin" ? "Rosin" : "Balanced";
    priceKey = "gummies";
    format = "gummies";
    strainType = "hybrid";
  } else if (parts[1] === "softgels") {
    categorySlug = "edibles";
    categoryName = "Edibles";
    lineSlug = "balanced";
    lineName = "Softgels";
    priceKey = "softgels";
    format = "softgels";
    strainType = "na";
  } else if (parts[1] === "accessories") {
    categorySlug = "accessories";
    categoryName = "Accessories";
    lineSlug = null;
    lineName = null;
    priceKey = "accessories";
    format = "device";
    strainType = "na";
  } else if (parts[1] === "prerolls") {
    categorySlug = "prerolls";
    categoryName = "Prerolls";
    lineSlug = "signature";
    lineName = "Signature";
    priceKey = "prerolls";
    format = "preroll";
    strainType = "hybrid";
  } else {
    return null;
  }

  const slug = leaf;
  const nameFromSlug = leaf
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    slug,
    leaf,
    brandPath: `/${parts.join("/")}`,
    categorySlug,
    categoryName,
    lineSlug,
    lineName,
    priceKey,
    format,
    strainType,
    jurisdictions,
    nameFromSlug,
  };
}

async function downloadImage(url, destPath) {
  if (!url || url.startsWith("data:")) return false;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "DIME-Enterprise-Catalog-Import/1.0" },
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, buf);
    return buf.length > 500;
  } catch {
    return false;
  }
}

function extFromUrl(url) {
  const clean = url.split("?")[0];
  const ext = path.extname(clean).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) return ext;
  return ".jpg";
}

function tsEscape(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

async function main() {
  console.log("Fetching sitemap…");
  const sm = await fetchText(SITEMAP);
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const productUrls = locs.filter((u) => {
    try {
      const p = new URL(u).pathname;
      return classify(p) != null;
    } catch {
      return false;
    }
  });

  console.log(`Found ${productUrls.length} product leaf URLs`);
  fs.mkdirSync(IMG_ROOT, { recursive: true });

  const products = [];
  let i = 0;
  for (const url of productUrls) {
    i += 1;
    const pathname = new URL(url).pathname;
    const metaInfo = classify(pathname);
    if (!metaInfo) continue;

    process.stdout.write(`[${i}/${productUrls.length}] ${metaInfo.slug}… `);
    let html = "";
    try {
      html = await fetchText(url);
    } catch (e) {
      console.log(`FAIL ${e.message}`);
      await sleep(200);
      continue;
    }

    const name =
      decodeHtml(meta(html, "og:title") || titleTag(html) || metaInfo.nameFromSlug) ||
      metaInfo.nameFromSlug;
    const description =
      decodeHtml(
        meta(html, "og:description") ||
          meta(html, "description") ||
          `${name} from DIME Industries. Lab-tested cannabis product.`
      ) || `${name} from DIME Industries.`;
    const ogImage = meta(html, "og:image");

    const imgDir = path.join(IMG_ROOT, metaInfo.slug);
    let imageUrl = null;
    const galleryUrls = [];
    if (ogImage) {
      const ext = extFromUrl(ogImage);
      const dest = path.join(imgDir, `primary${ext}`);
      const ok = await downloadImage(ogImage, dest);
      if (ok) {
        imageUrl = `/catalog/${metaInfo.slug}/primary${ext}`;
        galleryUrls.push(imageUrl);
      }
    }

    const price = PRICE_BANDS[metaInfo.priceKey] ?? PRICE_BANDS.default;
    const pot = POTENCY_BANDS[metaInfo.priceKey] ?? POTENCY_BANDS.default;
    const id = `p-${metaInfo.slug}`;
    const sku = metaInfo.slug.toUpperCase().replace(/-/g, "_").slice(0, 32);
    const effects =
      metaInfo.categorySlug === "accessories"
        ? []
        : metaInfo.strainType === "indica"
          ? ["relaxed", "calm"]
          : metaInfo.strainType === "sativa"
            ? ["uplifted", "energetic"]
            : ["balanced", "euphoric"];

    // Heuristic strain from name keywords
    let strainType = metaInfo.strainType;
    const lower = name.toLowerCase();
    if (strainType !== "na") {
      if (/\bog\b|kush|indica|chocolope|garlic|cookies|wedding/.test(lower)) strainType = "indica";
      else if (/diesel|haze|tangie|sativa|jet fuel|sour/.test(lower)) strainType = "sativa";
      else strainType = "hybrid";
    }

    products.push({
      id,
      slug: metaInfo.slug,
      name: name.replace(/\s+/g, " ").trim(),
      description: description.replace(/\s+/g, " ").trim().slice(0, 600),
      categorySlug: metaInfo.categorySlug,
      categoryName: metaInfo.categoryName,
      lineSlug: metaInfo.lineSlug,
      lineName: metaInfo.lineName,
      strainType,
      status: "active",
      allowedJurisdictions: metaInfo.jurisdictions,
      effects,
      coaUrl: `/lab-results?sku=${encodeURIComponent(sku)}`,
      createdAt: "2026-06-01T00:00:00.000Z",
      popularityScore: 50 + ((i * 7) % 50),
      imageUrl,
      galleryUrls,
      brandPath: metaInfo.brandPath,
      variants: [
        {
          id: `v-${metaInfo.slug}`,
          sku,
          weightOrFormat: metaInfo.format,
          retailPriceCents: price,
          thcPct: pot.thc,
          cbdPct: pot.cbd,
          cbnPct: pot.thc > 50 ? 0.2 : null,
          quantityOnHand: 120,
        },
      ],
    });
    console.log(imageUrl ? "ok+img" : "ok");
    await sleep(150);
  }

  // Deduplicate by slug
  const bySlug = new Map();
  for (const p of products) bySlug.set(p.slug, p);
  const unique = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));

  const body = unique
    .map((p) => {
      const variants = p.variants
        .map(
          (v) => `      {
        id: ${JSON.stringify(v.id)},
        sku: ${JSON.stringify(v.sku)},
        weightOrFormat: ${JSON.stringify(v.weightOrFormat)},
        retailPriceCents: ${v.retailPriceCents},
        thcPct: ${v.thcPct},
        cbdPct: ${v.cbdPct},
        cbnPct: ${v.cbnPct === null ? "null" : v.cbnPct},
        quantityOnHand: ${v.quantityOnHand},
      }`
        )
        .join(",\n");
      return `  {
    id: ${JSON.stringify(p.id)},
    slug: ${JSON.stringify(p.slug)},
    name: ${JSON.stringify(p.name)},
    description: ${JSON.stringify(p.description)},
    categorySlug: ${JSON.stringify(p.categorySlug)},
    categoryName: ${JSON.stringify(p.categoryName)},
    lineSlug: ${p.lineSlug === null ? "null" : JSON.stringify(p.lineSlug)},
    lineName: ${p.lineName === null ? "null" : JSON.stringify(p.lineName)},
    strainType: ${JSON.stringify(p.strainType)},
    status: "active",
    allowedJurisdictions: ${JSON.stringify(p.allowedJurisdictions)},
    effects: ${JSON.stringify(p.effects)},
    coaUrl: ${JSON.stringify(p.coaUrl)},
    createdAt: ${JSON.stringify(p.createdAt)},
    popularityScore: ${p.popularityScore},
    imageUrl: ${p.imageUrl === null ? "null" : JSON.stringify(p.imageUrl)},
    galleryUrls: ${JSON.stringify(p.galleryUrls)},
    brandPath: ${JSON.stringify(p.brandPath)},
    variants: [
${variants}
    ],
  }`;
    })
    .join(",\n");

  const file = `// AUTO-GENERATED by scripts/import-brand-catalog.mjs — do not edit by hand.
// PLACEHOLDER_PRICING=true — replace retailPriceCents from owner price sheet before go-live.
// Source: dimeindustries.com sitemap product leaves. Images under /public/catalog.

import type { CatalogProduct } from "./types";

export const PLACEHOLDER_PRICING = true as const;

export const BRAND_CATALOG: CatalogProduct[] = [
${body}
];
`;

  fs.writeFileSync(OUT_TS, file, "utf8");
  console.log(`Wrote ${unique.length} products → ${OUT_TS}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
