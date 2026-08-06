export function missingEnv(keys: string[]) {
  return keys.filter((key) => !process.env[key]);
}

export function syncNotConfigured(source: string, keys: string[]) {
  const missing = missingEnv(keys);

  if (missing.length === 0) {
    return null;
  }

  return {
    ok: false,
    source,
    status: "not_configured",
    missing,
    message: `${source} credentials are not configured yet. Add the missing Vercel environment variables before syncing.`
  };
}
