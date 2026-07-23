// lib/wholesale/access.ts
import "server-only";
import { getCurrentProfile } from "@/lib/auth/session";
import { getApprovedWholesaleAccount } from "./store";
import type { WholesaleAccount } from "./types";

export async function requireWholesaleBuyer(): Promise<{
  email: string;
  account: WholesaleAccount;
  role: string;
}> {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("AUTH_REQUIRED");
  }
  if (profile.role === "admin") {
    const account =
      (await getApprovedWholesaleAccount(profile.email)) ??
      ({
        email: profile.email,
        businessName: "Admin preview",
        licenseNumber: null,
        resaleCertUrl: null,
        status: "approved" as const,
        defaultPaymentTerms: "net30" as const,
        notes: "Admin bypass",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
      } satisfies WholesaleAccount);
    return { email: profile.email, account, role: profile.role };
  }
  if (profile.role === "wholesale") {
    const account =
      (await getApprovedWholesaleAccount(profile.email)) ??
      ({
        email: profile.email,
        businessName: "Wholesale demo",
        licenseNumber: null,
        resaleCertUrl: null,
        status: "approved" as const,
        defaultPaymentTerms: "net30" as const,
        notes: "Role-based access",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
      } satisfies WholesaleAccount);
    return { email: profile.email, account, role: profile.role };
  }
  const account = await getApprovedWholesaleAccount(profile.email);
  if (!account) throw new Error("WHOLESALE_REQUIRED");
  return { email: profile.email, account, role: profile.role };
}
