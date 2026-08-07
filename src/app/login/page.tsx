import Link from "next/link";
import { AlertTriangle, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { ZodaMark } from "@/components/brand/ZodaMark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shouldEnforceAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const errorMessages: Record<string, string> = {
  AccessDenied: "That Google account is not approved for this dashboard. Use a ZODA Google account ending in @zoda.sg.",
  OAuthSignin: "Google sign-in could not start. Check the OAuth client configuration in Google Cloud.",
  OAuthCallback: "Google returned an OAuth callback error. Check the OAuth consent screen and authorized redirect URI.",
  Configuration: "Authentication is missing a required server setting.",
  default: "Sign-in failed. Try again with your approved ZODA Google account."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authEnabled = shouldEnforceAuth();
  const params = await searchParams;
  const authError = params.error ? errorMessages[params.error] || errorMessages.default : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="grid w-full max-w-[960px] overflow-hidden rounded-lg border border-border bg-card shadow-zoda lg:grid-cols-[1fr_400px]">
        <div className="flex min-h-[520px] flex-col justify-between border-b border-border bg-sidebar p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div>
            <ZodaMark />
            <div className="mt-10 max-w-[520px]">
              <Badge variant="outline" className="border-primary/40 text-primary">
                Internal access
              </Badge>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Sign in to the ZODA performance dashboard.
              </h1>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                Access is restricted to approved ZODA Google accounts. The dashboard shows connected GA4 and Search Console data, with other sources marked until they are connected.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card/70 p-3">
              <ShieldCheck className="mb-3 h-4 w-4 text-primary" />
              @zoda.sg only
            </div>
            <div className="rounded-lg border border-border bg-card/70 p-3">
              <LockKeyhole className="mb-3 h-4 w-4 text-primary" />
              Protected analytics
            </div>
          </div>
        </div>

        <Card className="justify-center border-0 bg-card shadow-none">
          <CardHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              {authEnabled
                ? "Choose or enter a Google account ending in @zoda.sg."
                : "OAuth is not enforced yet. You can enter the dashboard while credentials are being configured."}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 px-6 pb-6 sm:px-8 sm:pb-8">
            {authError ? (
              <Alert className="border-red-400/30 bg-red-400/10 text-foreground">
                <AlertTriangle className="h-4 w-4 text-red-200" />
                <AlertTitle>Sign-in blocked</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            ) : null}

            <Alert className="border-primary/30 bg-primary/10 text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <AlertTitle>Required account</AlertTitle>
              <AlertDescription>
                Use a ZODA Google Workspace account. Personal Gmail or The Media Morphosys accounts will be rejected by Google or by the dashboard.
              </AlertDescription>
            </Alert>

            <div className="grid gap-2">
              <Label htmlFor="workspace-domain">Workspace domain</Label>
              <Input
                id="workspace-domain"
                readOnly
                value="@zoda.sg"
                className="h-11 bg-background font-mono text-sm"
              />
            </div>

            <div className="grid gap-3">
              {authEnabled ? (
                <GoogleSignInButton />
              ) : (
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants(), "h-11 w-full justify-center gap-2")}
                >
                  Continue to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <p className="text-xs leading-5 text-muted-foreground">
                {authEnabled
                  ? "Google may still block access if the OAuth app is limited to a different Workspace organization."
                  : "Add Google OAuth credentials in Vercel before opening production access."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
