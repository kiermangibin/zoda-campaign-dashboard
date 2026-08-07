import "server-only";
import { missingEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase";

type ShopifyGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type ShopifyOrdersQuery = {
  orders: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        createdAt: string;
        displayFinancialStatus: string | null;
        displayFulfillmentStatus: string | null;
        totalPriceSet: {
          shopMoney: {
            amount: string;
            currencyCode: string;
          };
        };
        subtotalPriceSet: {
          shopMoney: {
            amount: string;
          };
        } | null;
        totalTaxSet: {
          shopMoney: {
            amount: string;
          };
        } | null;
        totalShippingPriceSet: {
          shopMoney: {
            amount: string;
          };
        } | null;
      };
    }>;
  };
};

type ShopifyTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  associated_user_scope?: string;
};

type ShopifyConnection = {
  shop_domain: string;
  access_token: string;
  refresh_token: string | null;
  scope: string | null;
  expires_at: string | null;
};

export type ShopifySummary = {
  storeDomain: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totals: {
    orders: number;
    revenue: number;
    subtotal: number;
    tax: number;
    shipping: number;
  };
  rows: Array<{
    id: string;
    name: string;
    createdAt: string;
    financialStatus: string;
    fulfillmentStatus: string;
    totalPrice: number;
    subtotalPrice: number;
    totalTax: number;
    totalShipping: number;
    currencyCode: string;
  }>;
};

const ordersQuery = `
  query ZodaRecentOrders($query: String!, $first: Int!) {
    orders(first: $first, sortKey: CREATED_AT, reverse: true, query: $query) {
      edges {
        node {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          subtotalPriceSet {
            shopMoney {
              amount
            }
          }
          totalTaxSet {
            shopMoney {
              amount
            }
          }
          totalShippingPriceSet {
            shopMoney {
              amount
            }
          }
        }
      }
    }
  }
`;

function normalizeStoreDomain(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function numberValue(value?: string | null) {
  return Number(value || 0);
}

function isoDateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export function getShopifyMissingEnv() {
  return missingEnv(["SHOPIFY_STORE_DOMAIN"]);
}

export function getShopifyOAuthMissingEnv() {
  return missingEnv(["SHOPIFY_STORE_DOMAIN", "SHOPIFY_CLIENT_ID", "SHOPIFY_CLIENT_SECRET"]);
}

export function isShopifyConfigured() {
  return getShopifyMissingEnv().length === 0;
}

export function getShopifyStoreDomain() {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  return storeDomain ? normalizeStoreDomain(storeDomain) : null;
}

function getShopifyClientCredentials() {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Shopify OAuth client credentials are not configured.");
  }

  return { clientId, clientSecret };
}

function expiresAt(seconds?: number) {
  if (!seconds) return null;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

async function persistShopifyConnection(shopDomain: string, token: ShopifyTokenResponse) {
  const supabase = getSupabaseServerClient();

  if (!supabase || !token.access_token) return;

  const { error } = await supabase.from("shopify_connections").upsert(
    {
      shop_domain: normalizeStoreDomain(shopDomain),
      access_token: token.access_token,
      refresh_token: token.refresh_token ?? null,
      scope: token.scope ?? token.associated_user_scope ?? null,
      expires_at: expiresAt(token.expires_in),
      raw: {
        expires_in: token.expires_in ?? null,
        scope: token.scope ?? token.associated_user_scope ?? null
      },
      updated_at: new Date().toISOString()
    },
    { onConflict: "shop_domain" }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function getStoredShopifyConnection(shopDomain: string): Promise<ShopifyConnection | null> {
  const supabase = getSupabaseServerClient();

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("shopify_connections")
    .select("shop_domain,access_token,refresh_token,scope,expires_at")
    .eq("shop_domain", normalizeStoreDomain(shopDomain))
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function refreshShopifyAccessToken(shopDomain: string, refreshToken: string) {
  const { clientId, clientSecret } = getShopifyClientCredentials();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });

  const response = await fetch(`https://${normalizeStoreDomain(shopDomain)}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const payload = (await response.json()) as ShopifyTokenResponse & { error?: string; error_description?: string };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || "Shopify token refresh failed.");
  }

  await persistShopifyConnection(shopDomain, payload);

  return payload.access_token;
}

async function getShopifyAccessToken(shopDomain: string) {
  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  }

  const connection = await getStoredShopifyConnection(shopDomain);

  if (!connection?.access_token) {
    throw new Error("Shopify is not connected. Install the Shopify app from Settings before syncing.");
  }

  const expiresAtValue = connection.expires_at ? new Date(connection.expires_at).getTime() : null;
  const shouldRefresh = expiresAtValue ? expiresAtValue < Date.now() + 5 * 60 * 1000 : false;

  if (shouldRefresh && connection.refresh_token) {
    return refreshShopifyAccessToken(shopDomain, connection.refresh_token);
  }

  return connection.access_token;
}

export async function getShopifyConnectionStatus() {
  const storeDomain = getShopifyStoreDomain();
  const oauthMissing = getShopifyOAuthMissingEnv();

  if (!storeDomain) {
    return {
      configured: false,
      connected: false,
      storeDomain,
      message: "Add SHOPIFY_STORE_DOMAIN before connecting Shopify."
    };
  }

  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return {
      configured: true,
      connected: true,
      storeDomain,
      message: "Shopify Admin API token is configured in Vercel."
    };
  }

  if (oauthMissing.length > 0) {
    return {
      configured: false,
      connected: false,
      storeDomain,
      message: "Add Shopify OAuth client credentials before connecting."
    };
  }

  try {
    const connection = await getStoredShopifyConnection(storeDomain);

    if (connection?.access_token) {
      return {
        configured: true,
        connected: true,
        storeDomain,
        message: `Shopify is connected to ${storeDomain}.`
      };
    }
  } catch (error) {
    return {
      configured: true,
      connected: false,
      storeDomain,
      message: error instanceof Error ? error.message : "Shopify connection check failed."
    };
  }

  return {
    configured: true,
    connected: false,
    storeDomain,
    message: "Shopify app credentials are ready. Install the app to grant Admin API access."
  };
}

export async function exchangeShopifyAuthorizationCode(shopDomain: string, code: string) {
  const { clientId, clientSecret } = getShopifyClientCredentials();
  const normalizedDomain = normalizeStoreDomain(shopDomain);
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    expiring: "1"
  });

  const response = await fetch(`https://${normalizedDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const payload = (await response.json()) as ShopifyTokenResponse & { error?: string; error_description?: string };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || "Shopify authorization failed.");
  }

  await persistShopifyConnection(normalizedDomain, payload);
}

export async function fetchShopifySummary(days = 30): Promise<ShopifySummary> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;

  if (!storeDomain) {
    throw new Error("Shopify store domain is not configured.");
  }

  const normalizedDomain = normalizeStoreDomain(storeDomain);
  const accessToken = await getShopifyAccessToken(normalizedDomain);
  const startDate = isoDateDaysAgo(days);
  const endDate = isoDateDaysAgo(0);
  const response = await fetch(`https://${normalizedDomain}/admin/api/2026-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken
    },
    body: JSON.stringify({
      query: ordersQuery,
      variables: {
        first: 50,
        query: `created_at:>=${startDate}`
      }
    })
  });

  const payload = (await response.json()) as ShopifyGraphqlResponse<ShopifyOrdersQuery>;

  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message || `Shopify Admin API request failed with ${response.status}.`);
  }

  const rows = (payload.data?.orders.edges || []).map(({ node }) => ({
    id: node.id,
    name: node.name,
    createdAt: node.createdAt,
    financialStatus: node.displayFinancialStatus || "UNKNOWN",
    fulfillmentStatus: node.displayFulfillmentStatus || "UNKNOWN",
    totalPrice: numberValue(node.totalPriceSet.shopMoney.amount),
    subtotalPrice: numberValue(node.subtotalPriceSet?.shopMoney.amount),
    totalTax: numberValue(node.totalTaxSet?.shopMoney.amount),
    totalShipping: numberValue(node.totalShippingPriceSet?.shopMoney.amount),
    currencyCode: node.totalPriceSet.shopMoney.currencyCode
  }));

  const totals = rows.reduce(
    (sum, row) => ({
      orders: sum.orders + 1,
      revenue: sum.revenue + row.totalPrice,
      subtotal: sum.subtotal + row.subtotalPrice,
      tax: sum.tax + row.totalTax,
      shipping: sum.shipping + row.totalShipping
    }),
    { orders: 0, revenue: 0, subtotal: 0, tax: 0, shipping: 0 }
  );

  return {
    storeDomain: normalizedDomain,
    dateRange: { startDate, endDate },
    totals,
    rows
  };
}
