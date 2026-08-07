import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  createShopifyOAuthState,
  getShopifyAuthorizationUrl,
  getShopifyInstallReadiness,
  SHOPIFY_OAUTH_STATE_COOKIE
} from "@/lib/shopify-oauth";

export async function GET(request: NextRequest) {
  const readiness = getShopifyInstallReadiness();

  if (!readiness.ready) {
    return NextResponse.json(
      {
        ok: false,
        status: "not_configured",
        missing: readiness.missing,
        message: "Shopify OAuth credentials are not configured."
      },
      { status: 501 }
    );
  }

  const state = createShopifyOAuthState();
  const cookieStore = await cookies();
  cookieStore.set(SHOPIFY_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure: true
  });

  return NextResponse.redirect(getShopifyAuthorizationUrl({ requestUrl: request.url, state }));
}
