// lib/db/client.ts
import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

export function isDatabaseUrlConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/**
 * Prefer Supabase transaction pooler (6543) when the URL points at the
 * session pooler port — avoids slot exhaustion under parallel SSR.
 * Leave explicit ports and direct DB hosts unchanged.
 */
export function normalizeDatabaseUrl(raw: string): string {
  try {
    const u = new URL(raw);
    if (u.hostname.includes("pooler.supabase.com") && (u.port === "5432" || u.port === "")) {
      u.port = "6543";
    }
    return u.toString();
  } catch {
    return raw;
  }
}

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;
let cachedSql: ReturnType<typeof postgres> | null = null;

/** Server-only Drizzle client. Prefer service/pooled DATABASE_URL for writes. */
export function getDb() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!cached) {
    const url = normalizeDatabaseUrl(raw);
    const local = /localhost|127\.0\.0\.1/.test(url);
    cachedSql = postgres(url, {
      prepare: false,
      max: 5,
      // Fail fast during builds / cold starts instead of hanging until Next's 60s page timeout.
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 5,
      ...(local ? {} : { ssl: "require" as const }),
    });
    cached = drizzle(cachedSql, { schema });
  }
  return cached;
}
