import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { ZodaMark } from "@/components/brand/ZodaMark";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { shouldEnforceAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const authEnabled = shouldEnforceAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="grid w-full max-w-[960px] overflow-hidden rounded-lg border border-border bg-card shadow-zoda lg:grid-cols-[1fr_420px]">
        <div className="flex min-h-[520px] flex-col justify-between border-b border-border bg-sidebar p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div>
            <ZodaMark />
            <div className="mt-12 max-w-[520px]">
              <Badge variant="outline" className="border-primary/40 text-primary">
                Private dashboard
              </Badge>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Campaign access for the ZODA growth team.
              </h1>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                Review acquisition performance, channel mix, funnel movement, and next actions from one focused workspace.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card/70 p-3">
              <ShieldCheck className="mb-3 h-4 w-4 text-primary" />
              Approved account access
            </div>
            <div className="rounded-lg border border-border bg-card/70 p-3">
              <LockKeyhole className="mb-3 h-4 w-4 text-primary" />
              Production auth ready
            </div>
          </div>
        </div>

        <Card className="flex items-center border-0 bg-card shadow-none">
          <CardContent className="w-full p-6 sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold text-foreground">Sign in</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {authEnabled
                  ? "Use your approved ZODA Google account to continue."
                  : "OAuth is not enforced yet. You can enter the dashboard while credentials are being configured."}
              </p>
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
                  ? "Access is limited to approved @zoda.sg Google accounts."
                  : "Add Google OAuth credentials in Vercel before opening production access."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
