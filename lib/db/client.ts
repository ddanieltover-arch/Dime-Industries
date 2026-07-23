// lib/db/client.ts
import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

export function isDatabaseUrlConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;
let cachedSql: ReturnType<typeof postgres> | null = null;

/** Server-only Drizzle client. Prefer service/pooled DATABASE_URL for writes. */
export function getDb() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!cached) {
    cachedSql = postgres(url, { prepare: false, max: 5 });
    cached = drizzle(cachedSql, { schema });
  }
  return cached;
}
