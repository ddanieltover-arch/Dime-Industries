// middleware.ts (project root)
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isRole, hasAtLeastRole, type Role } from "@/lib/auth/roles";
import { isSupabaseConfigured, isDemoAuthAllowed } from "@/lib/auth/config";

const PROTECTED_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: "/admin", role: "admin" },
  // Wholesale shop: any signed-in buyer; page enforces approved account / wholesale role.
  { prefix: "/wholesale/shop", role: "customer" },
  { prefix: "/wholesale/checkout", role: "customer" },
  { prefix: "/account", role: "customer" },
];

const DEMO_SESSION_COOKIE = "dime_demo_session";

function readDemoRole(request: NextRequest): Role | null {
  if (!isDemoAuthAllowed()) return null;
  const raw = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { role?: string };
    if (parsed.role === "admin" || parsed.role === "customer" || parsed.role === "wholesale") {
      return parsed.role;
    }
    return "customer";
  } catch {
    return "customer";
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const match = PROTECTED_PREFIXES.find((p) => path.startsWith(p.prefix));

  if (!isSupabaseConfigured()) {
    if (!match) return NextResponse.next();

    if (!isDemoAuthAllowed()) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", path);
      loginUrl.searchParams.set("error", "auth_misconfigured");
      return NextResponse.redirect(loginUrl);
    }

    const demoRole = readDemoRole(request);
    if (!demoRole) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }

    if (!hasAtLeastRole(demoRole, match.role)) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
    return NextResponse.next();
  }

  const { response, user, supabase } = await updateSession(request);
  if (!match) return response;

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  const { data: row } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role: Role = row && isRole(row.role) ? row.role : "customer";

  if (!hasAtLeastRole(role, match.role)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|webp|css|js|woff2?|ico|xml|txt)$).*)",
  ],
};
