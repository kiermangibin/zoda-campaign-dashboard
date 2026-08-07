import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { ZodaMark } from "@/components/brand/ZodaMark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="w-full max-w-[420px] border-border bg-card shadow-zoda">
        <CardHeader className="space-y-6 px-6 pt-7 text-center sm:px-8">
          <div className="flex justify-center">
            <ZodaMark />
          </div>
          <div>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription className="mt-2">
              Use your ZODA Google account.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 px-6 pb-7 sm:px-8">
            {authError ? (
              <Alert className="border-red-400/30 bg-red-400/10 text-foreground">
                <AlertTriangle className="h-4 w-4 text-red-200" />
                <AlertTitle>Sign-in blocked</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            ) : null}

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
        </CardContent>
      </Card>
    </main>
  );
}
