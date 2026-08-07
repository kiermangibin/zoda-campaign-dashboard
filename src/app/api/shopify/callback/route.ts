import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { exchangeShopifyAuthorizationCode } from "@/lib/shopify";
import { SHOPIFY_OAUTH_STATE_COOKIE, verifyShopifyHmac } from "@/lib/shopify-oauth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(SHOPIFY_OAUTH_STATE_COOKIE)?.value;

  cookieStore.delete(SHOPIFY_OAUTH_STATE_COOKIE);

  if (!shop || !code || !state || !expectedState || state !== expectedState || !verifyShopifyHmac(searchParams)) {
    return NextResponse.redirect(new URL("/dashboard/settings?shopify=failed", request.url));
  }

  try {
    await exchangeShopifyAuthorizationCode(shop, code);
    return NextResponse.redirect(new URL("/dashboard/settings?shopify=connected", request.url));
  } catch {
    return NextResponse.redirect(new URL("/dashboard/settings?shopify=failed", request.url));
  }
}
