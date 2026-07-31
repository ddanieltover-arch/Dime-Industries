/**
 * scripts/refresh-catalog-images.mjs
 *
 * Re-scrapes product photography from dimeindustries.com listing pages
 * (og:image is logo-only — do not use it). Downloads into public/catalog,
 * then uploads to Supabase Storage and updates products.image_url.
 *
 * Usage: node scripts/refresh-catalog-images.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMG_ROOT = path.join(ROOT, "public", "catalog");
const BUCKET = "catalog";
const SITEMAP = "https://dimeindustries.com/sitemap-1.xml";

function loadEnvLocal() {
  try {
    const raw = readFileSync(path.join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = val;
    }
  } catch {
    // optional
  }
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

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

function slugFromProductUrl(url) {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    if (parts[0] !== "products" || parts.length < 2) return null;
    const last = parts[parts.length - 1];
    // skip category/line hubs
    if (
      ["vapes", "edibles", "accessories", "prerolls", "gummies", "softgels", "products"].includes(
        last
      )
    ) {
      return null;
    }
    if (/-line$/.test(last) || last === "state-exclusive" || last === "collaborations") {
      return null;
    }
    return last;
  } catch {
    return null;
  }
}

function isListingUrl(url) {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    if (parts[0] !== "products") return false;
    if (parts.length <= 2) return true;
    const last = parts[parts.length - 1];
    return (
      /-line$/.test(last) ||
      ["state-exclusive", "collaborations", "balanced", "rosin"].includes(last)
    );
  } catch {
    return false;
  }
}

function preferFullSize(url) {
  // Strip resize/fit query params that shrink art; keep ssl if present.
  try {
    const u = new URL(url);
    u.searchParams.delete("resize");
    u.searchParams.delete("fit");
    if (!u.searchParams.has("ssl")) u.searchParams.set("ssl", "1");
    if (!u.searchParams.has("w")) u.searchParams.set("w", "1200");
    return u.toString();
  } catch {
    return url;
  }
}

function isLogoOrJunk(url) {
  return /logo|favicon|cropped|font|\.ttf|\.svg|bar-3d|untitled-design|gotham|concrete-black|golden_texture|artboard-1/i.test(
    url
  );
}

function isProductArt(url) {
  if (!/^https?:\/\//i.test(url)) return false;
  if (isLogoOrJunk(url)) return false;
  if (!/wp-content\/uploads|i\d\.wp\.com/i.test(url)) return false;
  // Prefer packaging / product renders
  return /royalpear|aio|tank|softgel|gumm|battery|preroll|dimepack|\.png|\.jpe?g/i.test(url);
}

/** Extract slug → image URL from listing HTML (`<a href=...><img>` cards). */
function extractSlugImages(html) {
  const map = new Map();
  const re =
    /href=["']([^"']*\/products\/[^"']+)["'][^>]*>\s*<img[^>]+(?:src|data-src)=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    const src = decodeHtml(m[2]);
    const abs = href.startsWith("http") ? href : `https://dimeindustries.com${href}`;
    const slug = slugFromProductUrl(abs);
    if (!slug) continue;
    if (!isProductArt(src)) continue;
    if (/\.svg(\?|$)/i.test(src)) continue;
    if (!map.has(slug)) map.set(slug, preferFullSize(src));
  }
  return map;
}

async function downloadImage(url, destPath) {
  const res = await fetch(url, {
    headers: { "User-Agent": "DIME-Enterprise-Catalog-Import/1.0" },
    redirect: "follow",
  });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) return false; // reject tiny logos / placeholders
  mkdirSync(path.dirname(destPath), { recursive: true });
  writeFileSync(destPath, buf);
  return true;
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

function dbUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.hostname.includes("pooler.supabase.com") && u.port === "5432") {
      u.port = "6543";
    }
    return u.toString();
  } catch {
    return raw;
  }
}

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const databaseUrl = process.env.DATABASE_URL?.trim();
if (!supabaseUrl || !serviceKey || !databaseUrl) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL");
  process.exit(1);
}

console.log("Fetching sitemap…");
const sm = await fetchText(SITEMAP);
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const listingUrls = [
  "https://dimeindustries.com/products/",
  "https://dimeindustries.com/products/vapes/",
  "https://dimeindustries.com/products/edibles/",
  "https://dimeindustries.com/products/accessories/",
  "https://dimeindustries.com/products/prerolls/",
  ...locs.filter(isListingUrl),
];
const uniqueListings = [...new Set(listingUrls)];

const slugToImage = new Map();
for (const url of uniqueListings) {
  process.stdout.write(`Listing ${url}… `);
  try {
    const html = await fetchText(url);
    const found = extractSlugImages(html);
    let added = 0;
    for (const [slug, img] of found) {
      if (!slugToImage.has(slug)) {
        slugToImage.set(slug, img);
        added += 1;
      }
    }
    console.log(`${found.size} hits, ${added} new`);
  } catch (e) {
    console.log(`FAIL ${e.message}`);
  }
  await sleep(150);
}

console.log(`Mapped ${slugToImage.size} product images`);

mkdirSync(IMG_ROOT, { recursive: true });
let downloaded = 0;
const failures = [];

for (const [slug, imgUrl] of [...slugToImage.entries()].sort((a, b) =>
  a[0].localeCompare(b[0])
)) {
  const ext = /\.png/i.test(imgUrl.split("?")[0]) ? ".png" : ".jpg";
  const dest = path.join(IMG_ROOT, slug, `primary${ext}`);
  process.stdout.write(`Download ${slug}… `);
  try {
    const ok = await downloadImage(imgUrl, dest);
    const other = path.join(IMG_ROOT, slug, `primary${ext === ".png" ? ".jpg" : ".png"}`);
    if (ok && existsSync(other)) {
      try {
        unlinkSync(other);
      } catch {
        // ignore
      }
    }
    if (ok) {
      downloaded += 1;
      console.log("ok");
    } else {
      failures.push({ slug, imgUrl, error: "download failed / too small" });
      console.log("fail");
    }
  } catch (e) {
    failures.push({ slug, imgUrl, error: String(e.message || e) });
    console.log("fail");
  }
  await sleep(80);
}

console.log(`Downloaded ${downloaded}; failures ${failures.length}`);

// --- Upload to Storage + update DB ------------------------------------------
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets } = await supabase.storage.listBuckets();
if (!buckets?.some((b) => b.name === BUCKET)) {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  });
  if (error && !/already exists/i.test(error.message)) {
    console.error("createBucket failed:", error.message);
    process.exit(1);
  }
}

const sql = postgres(dbUrl(databaseUrl), {
  prepare: false,
  max: 1,
  ssl: "require",
  connect_timeout: 30,
});

let uploaded = 0;
let updated = 0;

const slugDirs = (await readdir(IMG_ROOT, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

for (const slug of slugDirs.sort()) {
  const dir = path.join(IMG_ROOT, slug);
  const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith("."));
  // Prefer non-empty primary files
  const usable = [];
  for (const file of files) {
    const abs = path.join(dir, file);
    const body = await readFile(abs);
    if (body.length < 2000) continue;
    usable.push({ file, body });
  }
  if (usable.length === 0) continue;

  const publicUrls = [];
  for (const { file, body } of usable) {
    const objectPath = `${slug}/${file}`;
    const { error } = await supabase.storage.from(BUCKET).upload(objectPath, body, {
      contentType: contentType(file),
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) {
      failures.push({ slug, file, error: error.message });
      continue;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    // Cache-bust so Next.js image optimizer picks up replaced objects.
    publicUrls.push(`${data.publicUrl}?v=20260801b`);
    uploaded += 1;
  }
  if (publicUrls.length === 0) continue;

  const primary =
    publicUrls.find((u) => /\/primary\.png/i.test(u)) ||
    publicUrls.find((u) => /\/primary\./i.test(u)) ||
    publicUrls[0];
  const gallery = [primary, ...publicUrls.filter((u) => u !== primary)];

  const result = await sql`
    update products
    set image_url = ${primary}, gallery_urls = ${gallery}
    where slug = ${slug}
    returning slug
  `;
  if (result.length) {
    updated += 1;
    console.log(`DB ${slug} ← ${primary.split("/").slice(-2).join("/")}`);
  }
}

console.log(
  JSON.stringify(
    {
      mapped: slugToImage.size,
      downloaded,
      uploaded,
      productsUpdated: updated,
      failures: failures.slice(0, 15),
    },
    null,
    2
  )
);

await sql.end({ timeout: 5 });
process.exit(failures.length > downloaded ? 1 : 0);
