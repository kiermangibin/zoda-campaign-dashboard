import "server-only";
import { missingEnv } from "@/lib/env";

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
  return missingEnv(["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_ACCESS_TOKEN"]);
}

export function isShopifyConfigured() {
  return getShopifyMissingEnv().length === 0;
}

export async function fetchShopifySummary(days = 30): Promise<ShopifySummary> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!storeDomain || !accessToken) {
    throw new Error("Shopify Admin API credentials are not configured.");
  }

  const normalizedDomain = normalizeStoreDomain(storeDomain);
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
