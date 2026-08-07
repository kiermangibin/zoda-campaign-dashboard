import "server-only";
import crypto from "crypto";
import { getShopifyOAuthMissingEnv, getShopifyStoreDomain } from "@/lib/shopify";

export const SHOPIFY_OAUTH_STATE_COOKIE = "zoda_shopify_oauth_state";
export const SHOPIFY_SCOPES = "read_orders,read_products";

export function getAppUrl(requestUrl?: string) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (fromEnv) {
    return fromEnv.startsWith("http") ? fromEnv : `https://${fromEnv}`;
  }

  if (requestUrl) {
    const url = new URL(requestUrl);
    return url.origin;
  }

  return "https://zoda-campaign-dashboard.vercel.app";
}

export function getShopifyInstallReadiness() {
  const storeDomain = getShopifyStoreDomain();
  const missing = getShopifyOAuthMissingEnv();

  return {
    ready: Boolean(storeDomain) && missing.length === 0,
    storeDomain,
    missing
  };
}

export function createShopifyOAuthState() {
  return crypto.randomBytes(24).toString("hex");
}

export function getShopifyAuthorizationUrl({ requestUrl, state }: { requestUrl: string; state: string }) {
  const storeDomain = getShopifyStoreDomain();
  const clientId = process.env.SHOPIFY_CLIENT_ID;

  if (!storeDomain || !clientId) {
    throw new Error("Shopify OAuth is not configured.");
  }

  const redirectUri = `${getAppUrl(requestUrl)}/api/shopify/callback`;
  const authUrl = new URL(`https://${storeDomain}/admin/oauth/authorize`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("scope", SHOPIFY_SCOPES);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  return authUrl;
}

export function verifyShopifyHmac(searchParams: URLSearchParams) {
  const hmac = searchParams.get("hmac");
  const secret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!hmac || !secret) return false;

  const params = Array.from(searchParams.entries())
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const digest = crypto.createHmac("sha256", secret).update(params).digest("hex");
  const hmacBuffer = Buffer.from(hmac, "hex");
  const digestBuffer = Buffer.from(digest, "hex");

  return hmacBuffer.length === digestBuffer.length && crypto.timingSafeEqual(hmacBuffer, digestBuffer);
}
