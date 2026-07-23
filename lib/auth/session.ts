// lib/auth/session.ts
// Server-only helpers for reading the current session/profile and enforcing
// role requirements. Import only from Server Components, Server Actions, or
// Route Handlers.

import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRole, hasAtLeastRole, type Role } from "@/lib/auth/roles";

export type Profile = {
  id: string;
  email: string;
  role: Role;
  jurisdiction: string | null;
  ageVerifiedAt: string | null;
  medicalPatient: boolean;
};

/**
 * Returns the current authenticated user's profile, or null if not signed in.
 * Never throws on "not signed in" — callers decide whether that's an error.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const { isSupabaseConfigured, isDemoAuthAllowed } = await import("@/lib/auth/config");

  if (!isSupabaseConfigured()) {
    if (!isDemoAuthAllowed()) return null;
    const { readDemoSession } = await import("@/lib/auth/demo-session");
    return readDemoSession();
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: row, error: profileError } = await supabase
    .from("users")
    .select("id, email, role, jurisdiction, age_verified_at, medical_patient")
    .eq("id", user.id)
    .single();

  if (profileError || !row) {
    // Auth row exists but the profile-sync trigger hasn't landed yet (rare
    // race right after signup) — treat as "no profile" rather than crashing.
    return null;
  }

  const role: Role = isRole(row.role) ? row.role : "customer";

  return {
    id: row.id,
    email: row.email,
    role,
    jurisdiction: row.jurisdiction,
    ageVerifiedAt: row.age_verified_at,
    medicalPatient: row.medical_patient,
  };
}

/** Requires a signed-in user; redirects to /login if not. */
export async function requireUser(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

/**
 * Requires a signed-in user with at least the given role. Redirects to /login
 * if unauthenticated, or to /403 if authenticated but under-privileged — the
 * distinction matters so a logged-in customer hitting /admin gets a clear
 * "not allowed" rather than being bounced back into a login loop.
 */
export async function requireRole(required: Role): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!hasAtLeastRole(profile.role, required)) redirect("/403");
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  return requireRole("admin");
}
