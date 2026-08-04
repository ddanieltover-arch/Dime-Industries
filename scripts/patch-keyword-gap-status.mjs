/**
 * Patch keyword_map.csv + keyword_gap*.csv after gap-closing work.
 * Run: node scripts/patch-keyword-gap-status.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

function patchCsv(path, mutator) {
  const raw = readFileSync(path, "utf8");
  const lines = raw.split(/\r?\n/);
  const out = lines.map((line, i) => {
    if (i === 0 || !line.trim()) return line;
    return mutator(line) ?? line;
  });
  writeFileSync(path, out.join("\n"));
}

function setGap(line, keywordNeedles, gap, note) {
  const lower = line.toLowerCase();
  if (!keywordNeedles.some((k) => lower.includes(k))) return null;
  // keyword_map: Gap is column index 7 (0-based) after Keyword,Volume,KD,CPC,Intent,URL,Type
  // Formats vary — replace ,Partial, or ,Y, near Gap field carefully via known patterns
  let next = line;
  if (/,Partial,/i.test(next)) next = next.replace(/,Partial,/i, `,${gap},`);
  else if (/,"?Y"?,/i.test(next)) next = next.replace(/,Y,/i, `,${gap},`).replace(/,"Y",/i, `,"${gap}",`);
  if (note && !next.includes(note.slice(0, 24))) {
    // append note in last column if Notes-like
    next = next.replace(/("?)$/, (m, q) => (q === '"' ? ` | ${note}"` : ` | ${note}`));
  }
  return next;
}

const mapPatches = [
  {
    keys: ["dime cart,", '"dime cart"'],
    gap: "N",
    note: "Hub deepened 2026-08-04 (cart/pen copy + beginners links)",
  },
  {
    keys: ["dime carts,", '"dime carts"'],
    gap: "N",
    note: "Hub deepened 2026-08-04",
  },
  {
    keys: ["dime pen,", '"dime pen"'],
    gap: "N",
    note: "Vapes hub targets dime pen 2026-08-04",
  },
  {
    keys: ["dime weed,", "dime of weed"],
    gap: "Partial",
    note: "Covered via carts hub + beginners; still brand slang",
  },
  {
    keys: ["dime flavors,", "best dime industries flavors", "dime cart flavors"],
    gap: "N",
    note: "Flavors blog published",
  },
  {
    keys: ["dime industries flower"],
    gap: "Partial",
    note: "Soft flower path via /shop + prerolls; no invented SKUs",
  },
  {
    keys: ["dime industries pre-roll", "dime industries prerolls"],
    gap: "Partial",
    note: "Prerolls hub + buying guide deepened",
  },
  {
    keys: ["dime thc las vegas", "dime industries las vegas"],
    gap: "N",
    note: "Nevada/LV local depth 2026-08-04",
  },
  {
    keys: ["dime dispensary"],
    gap: "Partial",
    note: "Locations hub dispensary language",
  },
  {
    keys: ["dime industries rosin"],
    gap: "N",
    note: "Rosin hub + what-is-dime-rosin published",
  },
  {
    keys: ["dime disposable", "dimes disposable", "dime dispo"],
    gap: "N",
    note: "Disposables landing + cart-vs-disposable",
  },
];

for (const file of [
  "docs/seo/keyword_map.csv",
  "docs/seo/keyword_gap.csv",
  "docs/seo/keyword_gap_priority.csv",
]) {
  patchCsv(file, (line) => {
    for (const p of mapPatches) {
      if (p.keys.some((k) => line.toLowerCase().includes(k.toLowerCase().replace(/"/g, "")))) {
        const patched = setGap(line, p.keys.map((k) => k.replace(/"/g, "")), p.gap, p.note);
        if (patched) return patched;
      }
    }
    return line;
  });
  console.log("patched", file);
}
