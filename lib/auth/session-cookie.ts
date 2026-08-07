// lib/auth/session-cookie.ts
// Lightweight auth-cookie presence checks — no Supabase network calls.

import "server-only";
import { cookies } from "next/headers";

/** True when a Supabase (or chunked) auth cookie is present. */
export async function hasAuthSessionCookie(): Promise<boolean> {
  const store = await cookies();
  return store
    .getAll()
    .some((c) => c.name.includes("auth-token") || (c.name.startsWith("sb-") && c.value.length > 0));
}
