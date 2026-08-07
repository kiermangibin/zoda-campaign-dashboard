import "server-only";
import { createSign } from "crypto";
import { readFile } from "fs/promises";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

const tokenUrl = "https://oauth2.googleapis.com/token";

function parseServiceAccountJson(value: string): ServiceAccountCredentials {
  const decoded = value.trim().startsWith("{")
    ? value
    : Buffer.from(value, "base64").toString("utf8");
  const parsed = JSON.parse(decoded) as Partial<ServiceAccountCredentials>;

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Google service account JSON must include client_email and private_key.");
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, "\n")
  };
}

export function getGoogleServiceAccountMissingEnv() {
  const hasInlineCredentials =
    Boolean(process.env.GA4_SERVICE_ACCOUNT_JSON) ||
    Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
  const hasApplicationCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  return hasInlineCredentials || hasApplicationCredentials ? [] : ["GA4_SERVICE_ACCOUNT_JSON"];
}

async function getServiceAccountCredentials() {
  if (process.env.GA4_SERVICE_ACCOUNT_JSON) {
    return parseServiceAccountJson(process.env.GA4_SERVICE_ACCOUNT_JSON);
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    };
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const file = await readFile(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8");
    return parseServiceAccountJson(file);
  }

  throw new Error("Google service account credentials are not configured.");
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createServiceAccountAssertion(credentials: ServiceAccountCredentials, scope: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: credentials.client_email,
      scope,
      aud: tokenUrl,
      iat: now,
      exp: now + 3600
    })
  );
  const unsignedToken = `${header}.${claim}`;
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(credentials.private_key);

  return `${unsignedToken}.${base64Url(signature)}`;
}

export async function getGoogleAccessToken(scope: string) {
  const assertion = createServiceAccountAssertion(await getServiceAccountCredentials(), scope);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const payload = (await response.json()) as { access_token?: string; error_description?: string; error?: string };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || "Google OAuth token request failed.");
  }

  return payload.access_token;
}
