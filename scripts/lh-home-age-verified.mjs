/**
 * EQTA — age-verified Lighthouse home CWV probe.
 * Usage: node scripts/lh-home-age-verified.mjs [baseUrl] [outJson]
 */
import { spawnSync } from "node:child_process";
import {
  writeFileSync,
  readFileSync,
  mkdirSync,
  existsSync,
  mkdtempSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = (process.argv[2] || "http://127.0.0.1:3010").replace(/\/$/, "");
const outPath =
  process.argv[3] || join(root, "docs/seo/_lh_home_age_verified.json");
const chrome =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

mkdirSync(dirname(outPath), { recursive: true });

const tmp = mkdtempSync(join(tmpdir(), "dime-lh-"));
const headersPath = join(tmp, "headers.json");
const tmpOut = join(tmp, "report.json");
writeFileSync(headersPath, JSON.stringify({ Cookie: "dime_age_verified=1" }));

let lighthouseCli;
try {
  lighthouseCli = require.resolve("lighthouse/cli/index.js");
} catch {
  lighthouseCli = null;
}

const chromeUserData = join(tmp, "chrome-user");
mkdirSync(chromeUserData, { recursive: true });

const args = [
  `${baseUrl}/`,
  "--only-categories=performance",
  "--form-factor=mobile",
  "--screenEmulation.mobile",
  "--throttling-method=simulate",
  `--chrome-path=${chrome}`,
  `--chrome-flags=--headless=new --no-sandbox --disable-gpu --user-data-dir=${chromeUserData}`,
  `--extra-headers=${headersPath}`,
  "--output=json",
  `--output-path=${tmpOut}`,
  "--quiet",
];

const result = lighthouseCli
  ? spawnSync(process.execPath, [lighthouseCli, ...args], {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
    })
  : spawnSync("npx", ["--yes", "lighthouse", ...args], {
      cwd: root,
      encoding: "utf8",
      shell: true,
      windowsHide: true,
    });

// Windows often EPERM on chrome-launcher temp cleanup after a successful audit.
const wroteReport = existsSync(tmpOut);
if (result.status !== 0 && !wroteReport) {
  console.error(result.stdout || "");
  console.error(result.stderr || "");
  process.exit(result.status || 1);
}
if (result.status !== 0 && wroteReport) {
  console.warn(
    "Lighthouse exited non-zero but wrote a report (likely chrome temp cleanup EPERM)."
  );
}

if (!wroteReport) {
  console.error("Lighthouse did not write", tmpOut);
  process.exit(1);
}

const raw = readFileSync(tmpOut, "utf8");
writeFileSync(outPath, raw, "utf8");

const report = JSON.parse(raw);
const lcp = report.audits["largest-contentful-paint"]?.numericValue ?? null;
const cls = report.audits["cumulative-layout-shift"]?.numericValue ?? null;
const fcp = report.audits["first-contentful-paint"]?.numericValue ?? null;
const tbt = report.audits["total-blocking-time"]?.numericValue ?? null;
const score = report.categories?.performance?.score ?? null;
const lcpItems =
  report.audits["largest-contentful-paint-element"]?.details?.items ?? [];
const lcpEl =
  lcpItems[0]?.node?.snippet ||
  lcpItems[0]?.node?.selector ||
  report.audits["largest-contentful-paint-element"]?.displayValue ||
  null;

const summary = {
  measuredAt: new Date().toISOString(),
  url: `${baseUrl}/`,
  ageVerifiedCookie: "dime_age_verified=1",
  formFactor: "mobile",
  budgets: { LCP_ms: 2500, CLS: 0.1 },
  LCP_ms: lcp,
  CLS: cls,
  FCP_ms: fcp,
  TBT_ms: tbt,
  performanceScore: score,
  lcpElement: lcpEl,
  pass: {
    LCP: typeof lcp === "number" ? lcp <= 2500 : false,
    CLS: typeof cls === "number" ? cls <= 0.1 : false,
  },
  output: outPath.replace(/\\/g, "/"),
};

const summaryPath = outPath.replace(/\.json$/i, ".summary.json");
writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
