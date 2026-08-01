/**
 * scripts/optimize-images.mjs
 *
 * Compresses the hero poster and converts catalog primaries to WebP.
 * Updates brand-catalog.generated.ts image paths to .webp when present.
 *
 * Usage: node scripts/optimize-images.mjs
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "public", "catalog");
const BRAND = path.join(ROOT, "public", "brand");
const GENERATED = path.join(ROOT, "lib", "catalog", "brand-catalog.generated.ts");

const HERO_MAX_W = 1920;
const HERO_QUALITY = 78;
const CATALOG_MAX_W = 1200;
const CATALOG_QUALITY = 78;

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function kb(n) {
  return `${(n / 1024).toFixed(1)}KB`;
}

function writeViaTemp(targetPath, buf) {
  const tmp = `${targetPath}.${process.pid}.tmp`;
  writeFileSync(tmp, buf);
  try {
    renameSync(tmp, targetPath);
  } catch {
    // Windows may lock an open preview; fall back to direct write then clean tmp.
    try {
      writeFileSync(targetPath, buf);
    } finally {
      if (existsSync(tmp)) unlinkSync(tmp);
    }
  }
}

async function optimizeHero() {
  const jpgPath = path.join(BRAND, "hero-poster.jpg");
  const webpPath = path.join(BRAND, "hero-poster.webp");
  if (!existsSync(jpgPath)) {
    console.warn("skip hero: hero-poster.jpg missing");
    return;
  }

  const before = statSync(jpgPath).size;
  // Load into memory so the source file handle is released before overwrite.
  const input = readFileSync(jpgPath);
  const pipeline = sharp(input).rotate().resize({
    width: HERO_MAX_W,
    height: HERO_MAX_W,
    fit: "inside",
    withoutEnlargement: true,
  });

  const webpBuf = await pipeline.clone().webp({ quality: HERO_QUALITY }).toBuffer();
  writeViaTemp(webpPath, webpBuf);

  const jpgBuf = await pipeline
    .clone()
    .jpeg({ quality: HERO_QUALITY, mozjpeg: true })
    .toBuffer();
  try {
    writeViaTemp(jpgPath, jpgBuf);
    console.log(
      `hero-poster: ${kb(before)} → jpg ${kb(jpgBuf.length)}, webp ${kb(webpBuf.length)}`
    );
  } catch (err) {
    console.warn(
      `hero-poster: webp ${kb(webpBuf.length)} written; jpg left at ${kb(before)} (${err.message})`
    );
  }
}

async function optimizeCatalog() {
  const sources = walkFiles(CATALOG).filter((f) =>
    /primary\.(jpe?g|png)$/i.test(path.basename(f))
  );

  let beforeTotal = 0;
  let afterTotal = 0;
  let converted = 0;

  for (const src of sources) {
    const dir = path.dirname(src);
    const webpPath = path.join(dir, "primary.webp");
    beforeTotal += statSync(src).size;

    const buf = await sharp(src)
      .rotate()
      .resize({
        width: CATALOG_MAX_W,
        height: CATALOG_MAX_W,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: CATALOG_QUALITY })
      .toBuffer();

    writeViaTemp(webpPath, buf);
    afterTotal += buf.length;
    converted += 1;
  }

  console.log(
    `catalog: ${converted} → WebP; source ${kb(beforeTotal)} → webp ${kb(afterTotal)}`
  );
  return converted;
}

function rewriteGeneratedCatalog() {
  if (!existsSync(GENERATED)) {
    console.warn("skip catalog rewrite: brand-catalog.generated.ts missing");
    return 0;
  }

  let text = readFileSync(GENERATED, "utf8");
  const before = text;
  text = text.replace(/\/catalog\/([a-z0-9-]+)\/primary\.(jpe?g|png)/gi, (match, slug) => {
    const webp = path.join(CATALOG, slug, "primary.webp");
    if (existsSync(webp)) return `/catalog/${slug}/primary.webp`;
    return match;
  });

  if (text === before) {
    console.log("catalog generated: no path updates");
    return 0;
  }

  writeFileSync(GENERATED, text);
  const count = (before.match(/\/catalog\/[a-z0-9-]+\/primary\.(jpe?g|png)/gi) || []).length;
  console.log(`catalog generated: rewrote ${count} image paths to .webp`);
  return count;
}

const converted = await optimizeHero().then(() => optimizeCatalog());
rewriteGeneratedCatalog();
console.log(`\nDone (${converted} catalog WebP files).`);
