// lib/admin/audit.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";

export const ADMIN_AUDIT_COOKIE = "dime_admin_audit";

const entrySchema = z.object({
  id: z.string(),
  actorEmail: z.string(),
  action: z.string(),
  entity: z.string(),
  entityId: z.string(),
  at: z.string(),
  detail: z.string().optional(),
});

export type AuditEntry = z.infer<typeof entrySchema>;

const jarSchema = z.object({
  entries: z.array(entrySchema).max(50),
});

export async function listAuditEntries(): Promise<AuditEntry[]> {
  const store = await cookies();
  const raw = store.get(ADMIN_AUDIT_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.entries : [];
  } catch {
    return [];
  }
}

export async function appendAudit(entry: Omit<AuditEntry, "id" | "at">): Promise<void> {
  const store = await cookies();
  const existing = await listAuditEntries();
  const next: AuditEntry = {
    ...entry,
    id: `aud_${crypto.randomUUID().slice(0, 8)}`,
    at: new Date().toISOString(),
  };
  const entries = [next, ...existing].slice(0, 50);
  store.set(ADMIN_AUDIT_COOKIE, encodeURIComponent(JSON.stringify({ entries })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  console.info("[admin.audit]", next);
}
