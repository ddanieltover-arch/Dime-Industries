import { readFileSync, writeFileSync, copyFileSync } from "node:fs";

const path = "docs/seo/content_calendar_90d.csv";
const t = readFileSync(path, "utf8");
const blogSlugs = [
  "best-dime-industries-flavors",
  "live-resin-vs-live-rosin",
  "how-to-charge-a-dime-battery",
  "what-is-in-a-dime-cartridge",
  "are-dime-carts-worth-it",
  "why-is-my-dime-cart-clogged",
  "how-to-store-a-dime-cart",
  "what-is-dime-rosin",
  "solventless-cart-guide",
  "dime-signature-explained",
  "melted-diamonds-vape-explained",
  "dime-edibles-buying-guide",
  "dime-prerolls-buying-guide",
  "how-to-read-a-dime-coa",
  "dime-warranty-and-validate",
  "beginners-guide-to-dime-carts",
  "what-battery-for-dime-cart",
  "dime-balanced-explained",
  "dime-state-exclusive-guide",
  "buy-dime-carts-online",
  "dime-rewards-explained",
  "dime-hardware-accessories-guide",
  "lab-tested-dime-carts",
  "where-to-buy-dime-carts",
  "find-dime-los-angeles-orange-county",
  "find-dime-phoenix-arizona",
  "dime-promotions-safe-shopping",
];

function parseCsvLine(line) {
  const cols = [];
  let cur = "";
  let q = false;
  for (const ch of line) {
    if (ch === '"') {
      q = !q;
      cur += ch;
    } else if (ch === "," && !q) {
      cols.push(cur);
      cur = "";
    } else cur += ch;
  }
  cols.push(cur);
  return cols;
}

const lines = t.split(/\r?\n/);
const out = lines.map((line, i) => {
  if (i === 0 || !line.trim()) return line;
  const cols = parseCsvLine(line);
  if (cols[6] !== "Planned") return line;
  const url = (cols[8] || "").replace(/^"|"$/g, "");
  const type = cols[2];
  if (url.includes("/blog/") && blogSlugs.some((s) => url.includes(s))) {
    cols[6] = "Published";
    return cols.join(",");
  }
  if (url.includes("/shop/vapes/disposables")) {
    cols[6] = "Published";
    return cols.join(",");
  }
  if (url.includes("/product/") && type === "Refresh") {
    cols[6] = "Published";
    return cols.join(",");
  }
  if (url.includes("#delivery")) {
    cols[6] = "Published";
    return cols.join(",");
  }
  if (url === "/faq" || url === "/glossary") {
    cols[6] = "Published";
    return cols.join(",");
  }
  return line;
});

writeFileSync(path, out.join("\n"));
copyFileSync(path, "docs/seo/content_calendar.csv");
const published = out.filter((l) => l.includes(",Published,")).length;
const planned = out.filter((l) => l.includes(",Planned,")).length;
console.log({ published, planned });
