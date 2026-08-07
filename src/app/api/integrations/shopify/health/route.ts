import { NextResponse } from "next/server";
import { getShopifyConnectionStatus } from "@/lib/shopify";

export async function GET() {
  const status = await getShopifyConnectionStatus();
  return NextResponse.json(status);
}
