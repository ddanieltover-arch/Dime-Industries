// lib/supabase/client.ts
// Browser-side Supabase client for Client Components. Uses only the public
// anon key — never import server.ts's service-role client here.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
