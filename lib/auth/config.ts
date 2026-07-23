// lib/auth/config.ts
type AuthEnv = {
  NODE_ENV?: string;
  ALLOW_DEMO_AUTH?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

export function isSupabaseConfigured(env: AuthEnv = process.env) {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL?.trim() && env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
}

/**
 * Demo cookie auth is for local/dev when Supabase env is absent.
 * Production requires either real Supabase OR explicit ALLOW_DEMO_AUTH=true
 * (emergency only — never leave on for dimeindustries.us).
 */
export function isDemoAuthAllowed(env: AuthEnv = process.env) {
  if (isSupabaseConfigured(env)) return false;
  if (env.NODE_ENV === "production" && env.ALLOW_DEMO_AUTH !== "true") {
    return false;
  }
  return true;
}
