// app/api/ready/route.ts
//
// Deeper than /api/health: configuration readiness for soft/public launch.
// Does not leak secret values. Returns 503 when production blockers fail.

import { NextResponse } from "next/server";
import { getLaunchStatus } from "@/lib/ops/launch-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getLaunchStatus();
  const http = status.readyForPublicTraffic ? 200 : 503;
  return NextResponse.json(
    {
      status: status.readyForPublicTraffic ? "ready" : "not_ready",
      softLaunch: status.softLaunch,
      environment: status.environment,
      checkedAt: status.checkedAt,
      checks: status.checks.map((c) => ({
        id: c.id,
        ok: c.ok,
        severity: c.severity,
        message: c.message,
      })),
    },
    { status: http }
  );
}
