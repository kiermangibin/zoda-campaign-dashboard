"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  CircleDot,
  Database,
  Gauge,
  Layers3,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
} from "lucide-react";
import { ZodaMark } from "@/components/brand/ZodaMark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Gauge },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: TrendingUp },
  { href: "/dashboard/channels", label: "Channels", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

type SupabaseStatus = {
  configured: boolean;
  connected: boolean;
  message: string;
  projectRef?: string;
};

type ShopifyStatus = {
  configured: boolean;
  connected: boolean;
  message: string;
};

type AuthSession = {
  user?: {
    name?: string | null;
    email?: string | null;
  };
};

type Navigate = (href: string) => void;

async function logout(navigate: Navigate) {
  try {
    const csrfResponse = await fetch("/api/auth/csrf");
    const csrf = (await csrfResponse.json()) as { csrfToken?: string };
    await fetch("/api/auth/signout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        csrfToken: csrf.csrfToken || "",
        callbackUrl: "/login",
        json: "true"
      })
    });
  } catch {
    // The redirect still lands on the local login page; failed signout should not leave the user stranded.
  }

  navigate("/login");
}

function NavigationLinks() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              isActive && "bg-muted text-foreground"
            )}
          >
            <span
              className={cn(
                "absolute left-0 h-5 w-0.5 rounded-r bg-transparent",
                isActive && "bg-primary"
              )}
            />
            <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent() {
  const router = useRouter();
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus | null>(null);
  const [shopifyStatus, setShopifyStatus] = useState<ShopifyStatus | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/integrations/supabase/health")
      .then((response) => response.json() as Promise<SupabaseStatus>)
      .then((status) => {
        if (mounted) setSupabaseStatus(status);
      })
      .catch(() => {
        if (mounted) {
          setSupabaseStatus({
            configured: false,
            connected: false,
            message: "Supabase status unavailable."
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    fetch("/api/integrations/shopify/health")
      .then((response) => response.json() as Promise<ShopifyStatus>)
      .then((status) => {
        if (mounted) setShopifyStatus(status);
      })
      .catch(() => {
        if (mounted) {
          setShopifyStatus({
            configured: false,
            connected: false,
            message: "Shopify status unavailable."
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    fetch("/api/auth/session")
      .then((response) => response.json() as Promise<AuthSession>)
      .then((currentSession) => {
        if (mounted) setSession(currentSession);
      })
      .catch(() => {
        if (mounted) setSession(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sources = useMemo(
    () => [
      { label: "Google", status: "ready", tone: "text-primary" },
      {
        label: "Shopify",
        status: !shopifyStatus
          ? "checking"
          : shopifyStatus.connected
            ? "connected"
            : shopifyStatus.configured
              ? "install needed"
              : "env needed",
        tone: !shopifyStatus
          ? "text-muted-foreground"
          : shopifyStatus.connected
            ? "text-primary"
            : "text-yellow-300"
      },
      {
        label: "Supabase",
        status: !supabaseStatus
          ? "checking"
          : supabaseStatus.connected
            ? "connected"
            : supabaseStatus.configured
              ? "check failed"
              : "env needed",
        tone: !supabaseStatus
          ? "text-muted-foreground"
          : supabaseStatus.connected
            ? "text-primary"
            : "text-yellow-300"
      }
    ],
    [shopifyStatus, supabaseStatus]
  );

  const accountName = session?.user?.name || "ZODA team";
  const accountEmail = session?.user?.email || "Not signed in";
  const accountInitials = accountName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "ZD";

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-6">
        <Link href="/dashboard" aria-label="ZODA dashboard home">
          <ZodaMark />
        </Link>
      </div>

      <div className="px-3">
        <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Workspace
        </p>
        <NavigationLinks />
      </div>

      <div className="mt-5 px-5">
        <Separator />
      </div>

      <div className="p-5 pt-4">
        <div className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Database className="h-4 w-4 text-primary" />
            Sources
          </div>
          <div className="mt-3 grid gap-2 text-xs">
            {sources.map((source) => (
              <div key={source.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-foreground">
                  <CircleDot className={cn("h-3 w-3", source.tone)} />
                  {source.label}
                </span>
                <span className="truncate text-muted-foreground">{source.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto p-5">
        <div className="rounded-md border border-border bg-muted/40 p-2.5">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-md">
              <AvatarFallback className="rounded-md bg-card text-xs font-semibold text-foreground">
                {accountInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{accountName}</p>
              <p className="truncate text-xs text-muted-foreground">{accountEmail}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => void logout(router.push)}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-sidebar-border lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/dashboard" aria-label="ZODA dashboard home">
              <ZodaMark compact />
            </Link>
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" size="icon" aria-label="Open navigation">
                    <Menu className="h-4 w-4" />
                  </Button>
                }
              />
              <SheetContent side="left" className="w-[300px] border-r border-border p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-primary">
                <Layers3 className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">ZODA Analytics</p>
                <p className="truncate text-xs text-muted-foreground">
                  Traffic, search, orders
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary">
              Live data
            </Badge>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
