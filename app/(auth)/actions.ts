// app/(auth)/actions.ts
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const emailSchema = z.string().email();
const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

// ---------------------------------------------------------------------------
// Email + password
// ---------------------------------------------------------------------------

export async function signUpWithEmail(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Supabase sends the confirmation email itself (project-level SMTP,
      // configured outside this codebase); this only controls where the
      // confirmation link lands once clicked.
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });

  if (error) {
    // Don't leak "email already registered" distinctly — that's a user-
    // enumeration vector. Generic message either way.
    return { error: "Couldn't create your account. Please try again." };
  }

  return { success: true };
}

export async function signInWithEmail(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Generic on purpose — don't reveal whether the email exists or the
    // password was wrong.
    return { error: "Invalid email or password." };
  }

  try {
    const { mergeGuestCartForUser } = await import("@/lib/cart");
    await mergeGuestCartForUser(parsed.data.email);
  } catch (err) {
    console.warn("[auth] cart merge failed", err);
  }

  try {
    const { mergeGuestWishlistForUser } = await import("@/lib/wishlist");
    await mergeGuestWishlistForUser(parsed.data.email);
  } catch (err) {
    console.warn("[auth] wishlist merge failed", err);
  }

  const { getCurrentProfile } = await import("@/lib/auth/session");
  const profile = await getCurrentProfile();
  const nextRaw = String(formData.get("next") ?? "");
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/account";
  redirect(profile?.role === "admin" ? "/admin" : next);
}

export async function resendVerificationEmail(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email");
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { error: "Enter a valid email address." };

  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/account` },
  });

  // Same response whether or not the email exists, to avoid enumeration.
  if (error) {
    return { error: "If that email has a pending signup, we've resent the link." };
  }
  return { success: true };
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export async function signOut() {
  const { isSupabaseConfigured } = await import("@/lib/auth/config");
  if (!isSupabaseConfigured()) {
    const { clearDemoSession } = await import("@/lib/auth/demo-session");
    await clearDemoSession();
    redirect("/");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInDemo(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { isSupabaseConfigured, isDemoAuthAllowed } = await import("@/lib/auth/config");
  if (isSupabaseConfigured()) {
    return { error: "Demo sign-in is only available when Supabase is not configured." };
  }
  if (!isDemoAuthAllowed()) {
    return {
      error:
        "Demo auth is disabled in production. Configure Supabase or set ALLOW_DEMO_AUTH=true.",
    };
  }

  const email = String(formData.get("email") ?? "");
  const roleRaw = String(formData.get("role") ?? "customer");
  const role =
    roleRaw === "admin" ? "admin" : roleRaw === "wholesale" ? "wholesale" : "customer";
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { error: "Enter a valid email address." };

  const { writeDemoSession } = await import("@/lib/auth/demo-session");
  await writeDemoSession(parsed.data, role);

  try {
    const { mergeGuestCartForUser } = await import("@/lib/cart");
    await mergeGuestCartForUser(parsed.data);
  } catch (err) {
    console.warn("[auth] cart merge failed", err);
  }

  try {
    const { mergeGuestWishlistForUser } = await import("@/lib/wishlist");
    await mergeGuestWishlistForUser(parsed.data);
  } catch (err) {
    console.warn("[auth] wishlist merge failed", err);
  }

  const next = String(
    formData.get("next") ??
      (role === "admin" ? "/admin" : role === "wholesale" ? "/wholesale/shop" : "/account")
  );
  redirect(
    next.startsWith("/")
      ? next
      : role === "admin"
        ? "/admin"
        : role === "wholesale"
          ? "/wholesale/shop"
          : "/account"
  );
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const profileUpdateSchema = z.object({
  phone: z.string().min(7).max(20).optional().or(z.literal("")),
});

export async function updateProfile(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const parsed = profileUpdateSchema.safeParse({
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // RLS (users_update_own) is what actually enforces that this can only ever
  // touch the caller's own row — this .eq() is belt-and-suspenders, not the
  // real security boundary.
  const { error } = await supabase
    .from("users")
    .update({ phone: parsed.data.phone || null })
    .eq("id", user.id);

  if (error) return { error: "Couldn't update your profile. Please try again." };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Role management (admin-only — callable only from admin UI/routes, which
// are themselves gated by middleware.ts + requireAdmin())
// ---------------------------------------------------------------------------

const roleChangeSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["guest", "customer", "wholesale", "admin", "vendor"]),
});

export async function setUserRole(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user: actor },
  } = await supabase.auth.getUser();
  if (!actor) return { error: "You must be signed in." };

  const parsed = roleChangeSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: "Invalid role change request." };

  // RLS (users_update_own) restricts non-admin writers to their own row and
  // this endpoint is writing someone else's role, so a non-admin caller will
  // simply have this update rejected by the database — but we also check
  // explicitly here to fail fast with a clear message rather than a silent
  // no-op update.
  const { data: actorRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", actor.id)
    .single();

  if (actorRow?.role !== "admin") {
    return { error: "Only admins can change roles." };
  }

  const { error } = await supabase
    .from("users")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);

  if (error) return { error: "Couldn't update role." };

  // Audit log — role changes are exactly the kind of admin action Security
  // Architecture §8 requires to be traceable.
  await supabase.from("audit_logs").insert({
    actor_id: actor.id,
    action: "role_change",
    entity: "users",
    entity_id: parsed.data.userId,
    diff: { role: parsed.data.role },
  });

  return { success: true };
}
