/**
 * One-off: sync a single catalog slug image to Supabase + DB.
 * Usage: node scripts/sync-one-catalog-image.mjs pineapple-kush
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BUCKET = "catalog";
const slug = process.argv[2];

if (!slug) {
  console.error("Usage: node scripts/sync-one-catalog-image.mjs <slug>");
  process.exit(1);
}

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

const dir = path.join(ROOT, "public", "catalog", slug);
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const files = (await readdir(dir)).filter((f) =>
  /\.(jpe?g|png|webp|gif|avif)$/i.test(f)
);
if (files.length === 0) {
  console.error(`No images in ${dir}`);
  process.exit(1);
}

const publicUrls = [];
for (const file of files) {
  const body = await readFile(path.join(dir, file));
  const objectPath = `${slug}/${file}`;
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, body, {
    contentType: contentType(file),
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) {
    console.error(`upload ${objectPath}:`, error.message);
    process.exit(1);
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  publicUrls.push(data.publicUrl);
  console.log("uploaded", objectPath);
}

const primary =
  publicUrls.find((u) => /\/primary\.webp/i.test(u)) ??
  publicUrls.find((u) => /\/primary\./i.test(u)) ??
  publicUrls[0];
const gallery = [primary, ...publicUrls.filter((u) => u !== primary)];

const sql = postgres(dbUrl(databaseUrl), {
  prepare: false,
  max: 1,
  ssl: "require",
  connect_timeout: 30,
});

const result = await sql`
  update products
  set image_url = ${primary}, gallery_urls = ${gallery}
  where slug = ${slug}
  returning slug, image_url
`;

console.log(JSON.stringify({ updated: result, primary }, null, 2));
await sql.end({ timeout: 5 });
process.exit(result.length ? 0 : 1);
