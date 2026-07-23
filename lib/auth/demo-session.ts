// lib/auth/demo-session.ts
// Local/dev session when Supabase is not configured.
// Never treat this as production identity — middleware only accepts it
// when isSupabaseConfigured() is false.

import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import type { Profile } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/roles";

export const DEMO_SESSION_COOKIE = "dime_demo_session";

const schema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["customer", "admin", "wholesale"]).default("customer"),
});

export async function readDemoSession(): Promise<Profile | null> {
  const store = await cookies();
  const raw = store.get(DEMO_SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = schema.safeParse(JSON.parse(decodeURIComponent(raw)));
    if (!parsed.success) return null;
    const role: Role = parsed.data.role;
    return {
      id: parsed.data.id,
      email: parsed.data.email,
      role,
      jurisdiction: null,
      ageVerifiedAt: new Date().toISOString(),
      medicalPatient: false,
    };
  } catch {
    return null;
  }
}

export async function writeDemoSession(
  email: string,
  role: "customer" | "admin" | "wholesale" = "customer"
): Promise<Profile> {
  const profile: Profile = {
    id: `demo_${Buffer.from(`${role}:${email.toLowerCase()}`).toString("base64url").slice(0, 24)}`,
    email: email.toLowerCase(),
    role,
    jurisdiction: null,
    ageVerifiedAt: new Date().toISOString(),
    medicalPatient: false,
  };
  const store = await cookies();
  store.set(
    DEMO_SESSION_COOKIE,
    encodeURIComponent(
      JSON.stringify({ id: profile.id, email: profile.email, role: profile.role })
    ),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    }
  );
  return profile;
}

export async function clearDemoSession(): Promise<void> {
  const store = await cookies();
  store.set(DEMO_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}
