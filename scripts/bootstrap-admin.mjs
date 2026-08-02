// scripts/bootstrap-admin.mjs
// Creates (or updates) the sales@ admin Auth user and promotes public.users.role.
// Usage: node scripts/bootstrap-admin.mjs
// Optional: ADMIN_BOOTSTRAP_PASSWORD=... node scripts/bootstrap-admin.mjs

import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvLocal();

const EMAIL = (process.env.ADMIN_EMAIL || "sales@dimeindustries.us").trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!url || !serviceKey || !databaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or DATABASE_URL");
  process.exit(1);
}

function generatePassword() {
  const raw = randomBytes(9).toString("base64url");
  // Satisfy app rules: ≥10 chars, 1 uppercase, 1 number
  return `Dime${raw}9A`;
}

const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim() || generatePassword();

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < perPage) return null;
    page += 1;
    if (page > 20) return null;
  }
}

const existing = await findUserByEmail(EMAIL);
let userId;

if (existing) {
  userId = existing.id;
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("Failed to update auth user:", error.message);
    process.exit(1);
  }
  console.log(`Updated existing Auth user: ${EMAIL}`);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("Failed to create auth user:", error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log(`Created Auth user: ${EMAIL}`);
}

const sql = postgres(databaseUrl, { prepare: false, max: 1 });
try {
  await sql`
    insert into public.users (id, email, role, created_at)
    values (${userId}::uuid, ${EMAIL}, 'admin', now())
    on conflict (id) do update
      set email = excluded.email,
          role = 'admin'
  `;
  console.log(`Promoted public.users.role = admin for ${EMAIL}`);
} finally {
  await sql.end({ timeout: 5 });
}

console.log("");
console.log("--- Admin login ---");
console.log(`Email:    ${EMAIL}`);
console.log(`Password: ${password}`);
console.log("URL:      /login  → then open /admin");
console.log("");
console.log("Change this password after first sign-in.");
