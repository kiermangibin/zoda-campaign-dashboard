import { NextResponse } from "next/server";
import { syncNotConfigured } from "@/lib/env";

export async function POST() {
  const missing = syncNotConfigured("Shopify", ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_ACCESS_TOKEN"]);

  if (missing) {
    return NextResponse.json(missing, { status: 501 });
  }

  return NextResponse.json({
    ok: false,
    source: "Shopify",
    status: "not_implemented",
    message: "Shopify sync contract is ready. Implement Admin API order/product fetch once token scope is approved."
  }, { status: 501 });
}
