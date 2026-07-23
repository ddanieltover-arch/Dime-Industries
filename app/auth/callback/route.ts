// app/auth/callback/route.ts
// Single callback target for both Google OAuth and email-verification links.
// Supabase redirects here with a `code` param; exchanging it sets the session
// cookie via the server client, then we send the user on to where they meant
// to go (or the age/jurisdiction gate first, if they haven't cleared it yet).

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Guard against open-redirect: only allow same-origin relative paths.
  const safeNext = next.startsWith("/") ? next : "/";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
