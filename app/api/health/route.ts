// app/api/health/route.ts
//
// Deliberately unauthenticated and minimal — this is what deploy workflows
// (deploy-staging.yml / deploy-production.yml) and an external uptime
// monitor hit. It answers exactly one question: "is the app up and can it
// reach its database," not "is every subsystem healthy." Don't grow this
// into a full dependency-status page — that's a different endpoint with
// different (admin-only) access needs.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const checkedAt = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { status: "ok", database: "unconfigured", checkedAt, mode: "demo" },
      { status: 200 }
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("categories").select("id").limit(1);

    if (error) {
      const body: Record<string, string> = {
        status: "error",
        database: "unreachable",
        checkedAt,
      };
      if (process.env.NODE_ENV !== "production") {
        body.detail = error.message;
      }
      return NextResponse.json(body, { status: 503 });
    }

    return NextResponse.json({ status: "ok", database: "reachable", checkedAt }, { status: 200 });
  } catch (err) {
    const body: Record<string, string> = {
      status: "error",
      database: "unreachable",
      checkedAt,
    };
    if (process.env.NODE_ENV !== "production") {
      body.detail = err instanceof Error ? err.message : "unknown error";
    }
    return NextResponse.json(body, { status: 503 });
  }
}
