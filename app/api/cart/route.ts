// app/api/cart/route.ts
import { NextResponse } from "next/server";
import { getCartSnapshot } from "@/lib/cart";

export async function GET() {
  const cart = await getCartSnapshot();
  return NextResponse.json(cart, {
    headers: { "Cache-Control": "no-store" },
  });
}
