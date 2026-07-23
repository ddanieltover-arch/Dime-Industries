// lib/supabase/server.ts
// Server-side Supabase client for Route Handlers and Server Actions.
// Never import this from a client component.
//
// Next.js 15 made cookies()/headers() async, so this factory is async too —
// every call site must `await createClient()`.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component during render — safe to ignore;
            // middleware.ts refreshes the session on the next request.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // See note above.
          }
        },
      },
    }
  );
}

// Admin-privileged client — service role key, server-only, never exposed to the
// client bundle. Use only for operations that must legitimately bypass RLS
// (e.g. the COA/Rewards sync jobs, admin audit-log writes). Everything else
// should go through createClient() above so RLS stays the enforced boundary.
export function createServiceRoleClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
