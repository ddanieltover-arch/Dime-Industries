// app/api/products/[slug]/route.ts
import { NextResponse } from "next/server";
import { getProductBySlug, primaryVariant, toProductCard } from "@/lib/catalog";
import { isLaunchJurisdiction } from "@/lib/compliance/age-gate";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const url = new URL(request.url);
  const jurisdictionRaw = url.searchParams.get("jurisdiction") ?? "";
  const jurisdiction = isLaunchJurisdiction(jurisdictionRaw) ? jurisdictionRaw : null;

  const product = getProductBySlug(slug, jurisdiction);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    product,
    card: toProductCard(product),
    primaryVariant: primaryVariant(product),
    jurisdiction,
  });
}
