import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { shouldEnforceAuth } from "@/lib/auth";

export default function LoginPage() {
  const authEnabled = shouldEnforceAuth();

  return (
    <main className="zoda-grid-bg flex min-h-screen items-center justify-center px-5 py-10">
      <section className="zoda-card w-full max-w-[520px] p-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-zoda-mint">Private dashboard</p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-none">ZODA campaign access</h1>
        <p className="mt-5 text-base font-semibold leading-relaxed text-zoda-muted">
          {authEnabled
            ? "Sign in with your ZODA Google account to view campaign performance."
            : "Google login is scaffolded for @zoda.sg users. Add OAuth credentials in Vercel to enforce production access."}
        </p>
        <div className="mt-8 grid gap-3">
          {authEnabled ? (
            <GoogleSignInButton />
          ) : (
            <Link
              href="/dashboard"
              className="bg-zoda-mint px-5 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-zoda-black"
            >
              Continue to dashboard
            </Link>
          )}
          <p className="text-xs font-semibold leading-relaxed text-zoda-muted">
            {authEnabled
              ? "Access is limited to approved @zoda.sg Google accounts."
              : "Until OAuth environment variables are configured, local and preview builds allow direct dashboard access for setup."}
          </p>
        </div>
      </section>
    </main>
  );
}
