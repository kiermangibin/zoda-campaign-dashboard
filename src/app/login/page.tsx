import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
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

export default function LoginPage() {
  const authEnabled = shouldEnforceAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="grid w-full max-w-[980px] overflow-hidden rounded-lg border border-border bg-card shadow-zoda lg:grid-cols-[1fr_420px]">
        <div className="flex min-h-[560px] flex-col justify-between border-b border-border bg-sidebar p-6 sm:p-8 lg:border-b-0 lg:border-r">
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
                Built around ZODA&apos;s mission to change how humans experience activewear, with performance data for drops, collections, and community growth.
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

        <Card className="justify-center border-0 bg-card shadow-none">
          <CardHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
                {authEnabled
                  ? "Use your approved ZODA Google account to continue."
                  : "OAuth is not enforced yet. You can enter the dashboard while credentials are being configured."}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 px-6 pb-6 sm:px-8 sm:pb-8">
            <Alert className="border-primary/30 bg-primary/10 text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertTitle>ZODA workspace</AlertTitle>
              <AlertDescription>
                Campaign data is private to approved ZODA operators and launch partners.
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
