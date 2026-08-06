export function isApprovedZodaEmail(email?: string | null) {
  if (!email) return false;
  return email.toLowerCase().endsWith("@zoda.sg");
}

export function shouldEnforceAuth() {
  return Boolean(
    process.env.NEXTAUTH_SECRET &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET
  );
}
