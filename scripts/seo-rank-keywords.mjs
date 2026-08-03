// scripts/seo-rank-keywords.mjs — build top-50 rank tracking list from keyword_map.csv
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = join(root, "docs/seo/keyword_map.csv");
const outPath = join(root, "docs/seo/rank_keywords_top50.csv");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      q = !q;
      continue;
    }
    if ((c === "," && !q) || ((c === "\n" || c === "\r") && !q)) {
      row.push(cur);
      cur = "";
      if (c === "\n" || (c === "\r" && text[i + 1] !== "\n")) {
        if (row.some((cell) => cell.length)) rows.push(row);
        row = [];
      }
      if (c === "\r" && text[i + 1] === "\n") i++;
      continue;
    }
    cur += c;
  }
  row.push(cur);
  if (row.some((cell) => cell.length)) rows.push(row);
  return rows;
}

const rows = parseCsv(readFileSync(csvPath, "utf8").trim());
const hdr = rows[0];
const i = (name) => hdr.indexOf(name);
const data = rows.slice(1).map((r) => ({
  keyword: r[i("Keyword")],
  url: r[i("Assigned Page URL")],
  intent: r[i("Intent")],
  priority: r[i("Priority")],
  volume: r[i("Volume")],
  gap: r[i("Gap")],
}));

const rank = (p) => (p === "High" ? 0 : p === "Medium" ? 1 : 2);
const sorted = [...data].sort(
  (a, b) => rank(a.priority) - rank(b.priority) || a.keyword.localeCompare(b.keyword)
);
const top = sorted.slice(0, 50);

const lines = [
  "Rank,Keyword,Assigned URL,Intent,Priority,Volume,Desktop Rank,Mobile Rank,Featured Snippet,PAA,AI Overview,Last Checked,Notes",
  ...top.map((k, idx) =>
    [
      idx + 1,
      `"${k.keyword.replace(/"/g, '""')}"`,
      k.url,
      k.intent,
      k.priority,
      k.volume,
      "",
      "",
      "",
      "",
      "",
      "",
      k.gap === "Y" ? "Gap content planned" : "",
    ].join(",")
  ),
];

writeFileSync(outPath, lines.join("\n") + "\n");
console.log(`Wrote ${top.length} keywords → ${outPath}`);
