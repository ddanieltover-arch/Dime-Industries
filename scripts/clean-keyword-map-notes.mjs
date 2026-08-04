import { readFileSync, writeFileSync } from "node:fs";
const path = "docs/seo/keyword_map.csv";
let lines = readFileSync(path, "utf8").split(/\r?\n/);
lines = lines.map((l) => {
  if (l.startsWith("live resin vs live rosin,")) {
    return l
      .replace(",Y,", ",N,")
      .replace("Brief ready,Calendar 2026-08-07", "Published 2026-08-04");
  }
  if (l.startsWith("what is dime rosin,")) {
    return "what is dime rosin,Low-Medium,Low,Low,Informational,/blog/what-is-dime-rosin,Blog,N,Medium,Rosin GEO,,Published 2026-08-04";
  }
  if (l.startsWith("are dime carts worth it,")) {
    return l.replace(",Y,", ",N,").replace(/Brief ready.*$/, "Published 2026-08-04");
  }
  if (l.startsWith("why is my dime cart clogged,")) {
    return l.replace(",Y,", ",N,").replace(/Brief ready.*$/, "Published 2026-08-04");
  }
  if (l.startsWith("what is in a dime cartridge,")) {
    return l.replace(",Y,", ",N,").replace(/Brief ready.*$/, "Published 2026-08-04");
  }
  if (l.startsWith("best dime industries flavors,")) {
    return l.replace(",Y,", ",N,").replace(/Brief ready.*$/, "Published 2026-08-04");
  }
  const keepHubNote =
    l.startsWith("dime cart,") ||
    l.startsWith("dime carts,") ||
    l.startsWith("dime pen,") ||
    l.startsWith("dime industries carts,");
  if (!keepHubNote && l.includes("Hub deepened 2026-08-04")) {
    return l.replace(/\s*\|\s*Hub deepened 2026-08-04[^\"]*/g, "");
  }
  return l;
});
writeFileSync(path, lines.join("\n"));
console.log("cleaned");
