// lib/supabase/middleware.ts
// Refreshes the Supabase session cookie on every request. Root middleware.ts
// calls this before doing any route-protection logic, so auth state is never
// stale when a role check happens downstream.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Fail-fast so a stuck Auth host cannot hold every soft-nav on loading.tsx. */
const GET_USER_TIMEOUT_MS = 3_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`[timeout] ${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export type SessionUpdateResult = {
  response: NextResponse;
  user: { id: string } | null;
  supabase: ReturnType<typeof createServerClient>;
  /** True when getUser never settled in time — public routes fail open. */
  timedOut: boolean;
};

export async function updateSession(request: NextRequest): Promise<SessionUpdateResult> {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // IMPORTANT: this call is what actually refreshes the token — do not remove
  // it, and do not run any logic between session creation and this call.
  try {
    const {
      data: { user },
    } = await withTimeout(supabase.auth.getUser(), GET_USER_TIMEOUT_MS, "middleware-getUser");
    return { response, user, supabase, timedOut: false };
  } catch (err) {
    console.warn("[auth] middleware getUser timed out or failed", err);
    return {
      response: NextResponse.next({ request: { headers: request.headers } }),
      user: null,
      supabase,
      timedOut: true,
    };
  }
}
