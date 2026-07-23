// scripts/apply-migrations.mjs
import postgres from "postgres";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

console.log("Host:", url.replace(/:[^:@/]+@/, ":****@"));

function isBenign(msg) {
  return /already exists|duplicate key|multiple primary keys/i.test(msg);
}

async function applyFile(label, body) {
  // Fresh connection per file so a skipped error cannot abort later files.
  const sql = postgres(url, {
    prepare: false,
    max: 1,
    ssl: "require",
    connect_timeout: 30,
  });
  process.stdout.write(`Applying ${label}... `);
  try {
    await sql.unsafe(body);
    console.log("ok");
    await sql.end({ timeout: 5 });
    return true;
  } catch (err) {
    const msg = String(err?.message ?? err);
    if (isBenign(msg)) {
      console.log("skip (exists)");
      await sql.end({ timeout: 5 });
      return true;
    }
    console.log("FAILED");
    console.error(msg);
    await sql.end({ timeout: 5 });
    return false;
  }
}

const dir = join(root, "db", "migrations");
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const f of files) {
  const body = await readFile(join(dir, f), "utf8");
  const ok = await applyFile(f, body);
  if (!ok) process.exit(1);
}

const rlsPath = join(root, "db", "rls_policies.sql");
try {
  const rls = await readFile(rlsPath, "utf8");
  await applyFile("rls_policies.sql", rls);
} catch (err) {
  console.warn("RLS:", String(err?.message ?? err).slice(0, 200));
}

const sql = postgres(url, { prepare: false, max: 1, ssl: "require" });
const tables = await sql`
  select tablename from pg_tables
  where schemaname = 'public'
    and (tablename like 'commerce_%' or tablename in ('users','products','orders'))
  order by tablename
`;
console.log(
  "Key tables:",
  tables.map((t) => t.tablename).join(", ") || "(none)"
);
await sql.end({ timeout: 5 });
console.log("Done.");
