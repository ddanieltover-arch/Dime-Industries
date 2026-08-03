// scripts/content-freshness.mjs — Flag CMS seed posts not updated in > 6 months
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");
const months = Number(process.env.FRESHNESS_MONTHS || 6);
const cutoff = Date.now() - months * 30 * 24 * 60 * 60 * 1000;

const store = readFileSync(join(root, "lib/cms/store.ts"), "utf8");

// Match seed post blocks: slug + updatedAt nearby (best-effort parse)
const postChunks = store.split(/slug:\s*"/).slice(1);
const stale = [];
const reviewed = [];

for (const chunk of postChunks) {
  const slug = chunk.slice(0, chunk.indexOf('"'));
  if (!slug || slug.includes(" ") || slug.length > 80) continue;
  const updatedMatch = chunk.match(/updatedAt:\s*"([^"]+)"/);
  if (!updatedMatch) continue;
  const updatedAt = updatedMatch[1];
  const ts = Date.parse(updatedAt);
  if (Number.isNaN(ts)) continue;
  reviewed.push({ slug, updatedAt });
  if (ts < cutoff) stale.push({ slug, updatedAt });
}

console.log(`Content freshness: ${reviewed.length} posts scanned; stale threshold ${months} months.`);
if (!stale.length) {
  console.log("No stale seed posts.");
  process.exit(0);
}

console.log("Stale posts (review / refresh recommended):");
for (const p of stale) {
  console.log(`  - ${p.slug} (updatedAt ${p.updatedAt})`);
}

if (strict) {
  console.error(`Freshness gate failed: ${stale.length} stale post(s).`);
  process.exit(1);
}
console.warn(`Freshness warnings only (${stale.length}). Re-run with --strict to fail CI.`);
process.exit(0);
