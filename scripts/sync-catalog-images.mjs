/**
 * scripts/sync-catalog-images.mjs
 *
 * Uploads public/catalog/{slug}/* to Supabase Storage bucket `catalog`
 * and writes public URLs onto products.image_url / gallery_urls.
 *
 * Usage: node scripts/sync-catalog-images.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMG_ROOT = path.join(ROOT, "public", "catalog");
const BUCKET = "catalog";

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

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".avif") return "image/avif";
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

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
if (listErr) {
  console.error("listBuckets failed:", listErr.message);
  process.exit(1);
}

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
  console.log(`Created public bucket: ${BUCKET}`);
} else {
  console.log(`Bucket ready: ${BUCKET}`);
}

let slugDirs = [];
try {
  const entries = await readdir(IMG_ROOT, { withFileTypes: true });
  slugDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
} catch {
  console.error(`Missing ${IMG_ROOT} — run catalog:import first`);
  process.exit(1);
}

const sql = postgres(dbUrl(databaseUrl), {
  prepare: false,
  max: 1,
  ssl: "require",
  connect_timeout: 30,
});

let uploaded = 0;
let updated = 0;
let skipped = 0;
const failures = [];

for (const slug of slugDirs.sort()) {
  const dir = path.join(IMG_ROOT, slug);
  const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f));
  if (files.length === 0) {
    skipped += 1;
    continue;
  }

  const publicUrls = [];
  for (const file of files) {
    const abs = path.join(dir, file);
    const body = await readFile(abs);
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
    publicUrls.push(data.publicUrl);
    uploaded += 1;
  }

  if (publicUrls.length === 0) continue;

  const primary = publicUrls.find((u) => /\/primary\./i.test(u)) ?? publicUrls[0];
  const gallery = [primary, ...publicUrls.filter((u) => u !== primary)];

  const result = await sql`
    update products
    set
      image_url = ${primary},
      gallery_urls = ${gallery}
    where slug = ${slug}
    returning slug
  `;
  if (result.length > 0) {
    updated += 1;
    process.stdout.write(`  ${slug}: ok\n`);
  } else {
    skipped += 1;
    process.stdout.write(`  ${slug}: no product row\n`);
  }
}

console.log(
  JSON.stringify(
    {
      ok: failures.length === 0,
      uploaded,
      productsUpdated: updated,
      skipped,
      failures: failures.slice(0, 10),
    },
    null,
    2
  )
);

await sql.end({ timeout: 5 });
process.exit(failures.length ? 1 : 0);
