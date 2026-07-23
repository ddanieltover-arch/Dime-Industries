// app/r/[code]/route.ts
import { NextResponse } from "next/server";
import { recordAffiliateClick } from "@/lib/affiliate/store";

type Params = Promise<{ code: string }>;

/** Affiliate referral landing — records click and redirects to shop. */
export async function GET(_request: Request, { params }: { params: Params }) {
  const { code } = await params;
  await recordAffiliateClick(code);
  return NextResponse.redirect(new URL("/shop", _request.url));
}
