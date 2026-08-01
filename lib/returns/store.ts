// lib/returns/store.ts
import "server-only";
import { cookies } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { commerceReturns } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import { getOrderById } from "@/lib/checkout";
import type { ReturnReason, ReturnRequest, ReturnStatus } from "./types";
import { RETURN_REASONS } from "./types";

export const RETURNS_COOKIE = "dime_returns";

const returnSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  email: z.string().email(),
  status: z.enum(["requested", "approved", "denied", "refunded"]),
  reason: z.enum(["defective_hardware", "wrong_item", "damaged_shipping", "other"]),
  details: z.string().nullable(),
  adminNote: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  resolvedAt: z.string().nullable(),
});

const jarSchema = z.object({ returns: z.array(returnSchema).max(200) });

async function readCookieReturns(): Promise<ReturnRequest[]> {
  const store = await cookies();
  const raw = store.get(RETURNS_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.returns : [];
  } catch {
    return [];
  }
}

async function writeCookieReturns(returns: ReturnRequest[]): Promise<void> {
  const store = await cookies();
  store.set(
    RETURNS_COOKIE,
    encodeURIComponent(JSON.stringify({ returns: returns.slice(0, 200) })),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    }
  );
}

function rowToReturn(row: typeof commerceReturns.$inferSelect): ReturnRequest {
  return {
    id: row.id,
    orderId: row.orderId,
    email: row.email,
    status: row.status as ReturnStatus,
    reason: row.reason as ReturnReason,
    details: row.details,
    adminNote: row.adminNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
  };
}

export async function listReturns(email?: string): Promise<ReturnRequest[]> {
  if (isGrowthDatabaseMode()) {
    const db = getDb();
    const rows = email
      ? await db
          .select()
          .from(commerceReturns)
          .where(eq(commerceReturns.email, email.toLowerCase()))
          .orderBy(desc(commerceReturns.createdAt))
      : await db
          .select()
          .from(commerceReturns)
          .orderBy(desc(commerceReturns.createdAt))
          .limit(100);
    return rows.map(rowToReturn);
  }
  const all = await readCookieReturns();
  const sorted = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return email ? sorted.filter((r) => r.email === email.toLowerCase()) : sorted;
}

export async function getReturnByOrderId(orderId: string): Promise<ReturnRequest | null> {
  const all = await listReturns();
  return (
    all.find(
      (r) =>
        r.orderId === orderId &&
        (r.status === "requested" || r.status === "approved" || r.status === "refunded")
    ) ??
    all.find((r) => r.orderId === orderId) ??
    null
  );
}

export async function requestReturn(input: {
  orderId: string;
  email: string;
  reason: string;
  details?: string;
}): Promise<{ ok: true; request: ReturnRequest } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const orderId = input.orderId.trim();
  const reason = input.reason as ReturnReason;
  if (!RETURN_REASONS.includes(reason)) {
    return { ok: false, error: "Select a valid return reason." };
  }

  const order = await getOrderById(orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (order.email.toLowerCase() !== email) {
    return { ok: false, error: "Order does not belong to this account." };
  }
  if (order.status !== "payment_confirmed") {
    return {
      ok: false,
      error: "Returns are only available after payment is confirmed.",
    };
  }

  const existing = await listReturns(email);
  if (
    existing.some(
      (r) =>
        r.orderId === orderId &&
        (r.status === "requested" || r.status === "approved" || r.status === "refunded")
    )
  ) {
    return { ok: false, error: "A return is already open for this order." };
  }

  const now = new Date().toISOString();
  const details = input.details?.trim() ? input.details.trim().slice(0, 2000) : null;
  const request: ReturnRequest = {
    id: `ret_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    orderId,
    email,
    status: "requested",
    reason,
    details,
    adminNote: null,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
  };

  if (isGrowthDatabaseMode()) {
    const db = getDb();
    await db.insert(commerceReturns).values({
      id: request.id,
      orderId: request.orderId,
      email: request.email,
      status: request.status,
      reason: request.reason,
      details: request.details,
      adminNote: null,
      createdAt: new Date(request.createdAt),
      updatedAt: new Date(request.updatedAt),
      resolvedAt: null,
    });
  } else {
    const all = await readCookieReturns();
    await writeCookieReturns([request, ...all]);
  }

  return { ok: true, request };
}

export async function reviewReturn(
  returnId: string,
  status: "approved" | "denied" | "refunded",
  adminNote?: string
): Promise<ReturnRequest | null> {
  const now = new Date();
  const note = adminNote?.trim() || null;

  if (isGrowthDatabaseMode()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(commerceReturns)
      .where(eq(commerceReturns.id, returnId))
      .limit(1);
    const current = rows[0];
    if (!current) return null;

    const currentStatus = current.status as ReturnStatus;
    if (status === "approved" || status === "denied") {
      if (currentStatus !== "requested") return null;
    } else if (status === "refunded") {
      if (currentStatus !== "approved" && currentStatus !== "requested") return null;
    }

    await db
      .update(commerceReturns)
      .set({
        status,
        adminNote: note ?? current.adminNote,
        updatedAt: now,
        resolvedAt: status === "denied" || status === "refunded" ? now : current.resolvedAt,
      })
      .where(eq(commerceReturns.id, returnId));

    const updated = await db
      .select()
      .from(commerceReturns)
      .where(eq(commerceReturns.id, returnId))
      .limit(1);
    return updated[0] ? rowToReturn(updated[0]) : null;
  }

  const all = await readCookieReturns();
  const idx = all.findIndex((r) => r.id === returnId);
  if (idx < 0) return null;
  const current = all[idx]!;

  if (status === "approved" || status === "denied") {
    if (current.status !== "requested") return null;
  } else if (status === "refunded") {
    if (current.status !== "approved" && current.status !== "requested") return null;
  }

  const next: ReturnRequest = {
    ...current,
    status,
    adminNote: note ?? current.adminNote,
    updatedAt: now.toISOString(),
    resolvedAt:
      status === "denied" || status === "refunded" ? now.toISOString() : current.resolvedAt,
  };
  all[idx] = next;
  await writeCookieReturns(all);
  return next;
}

export async function returnsAdminSummary() {
  const returns = await listReturns();
  return {
    returns,
    requestedCount: returns.filter((r) => r.status === "requested").length,
    approvedCount: returns.filter((r) => r.status === "approved").length,
    refundedCount: returns.filter((r) => r.status === "refunded").length,
  };
}
