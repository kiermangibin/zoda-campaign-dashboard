"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  CircleDot,
  Database,
  Gauge,
  HelpCircle,
  Layers3,
  Menu,
  MoreVertical,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { ZodaMark } from "@/components/brand/ZodaMark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Gauge },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: TrendingUp },
  { href: "/dashboard/channels", label: "Channels", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

const utilityItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/settings", label: "Get Help", icon: HelpCircle },
  { href: "/dashboard", label: "Search", icon: Search }
];

type SupabaseStatus = {
  configured: boolean;
  connected: boolean;
  message: string;
  projectRef?: string;
};

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
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus | null>(null);

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

  const sources = useMemo(
    () => [
      { label: "Google", status: "ready", tone: "text-primary" },
      { label: "Shopify", status: "token needed", tone: "text-yellow-300" },
      {
        label: "Supabase",
        status: supabaseStatus?.connected
          ? "connected"
          : supabaseStatus?.configured
            ? "check failed"
            : "env needed",
        tone: supabaseStatus?.connected ? "text-primary" : "text-yellow-300"
      }
    ],
    [supabaseStatus]
  );

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

      <div className="grid gap-3 p-5 pt-4">
        <Card size="sm" className="border-border bg-card">
          <CardContent className="p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Access
            </span>
            <Badge className="bg-primary/15 text-primary">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Active
            </Badge>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Google auth is limited to approved @zoda.sg accounts.
          </p>
          </CardContent>
        </Card>

        <Card size="sm" className="border-border bg-card">
          <CardContent className="p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Database className="h-4 w-4 text-primary" />
            Data sources
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
          </CardContent>
        </Card>
      </div>

      <div className="mt-auto p-5">
        <div className="grid gap-1 pb-3">
          {utilityItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex h-9 items-center gap-3 rounded-md px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg bg-muted/70 p-2.5 text-left transition-colors hover:bg-muted"
        >
          <Avatar className="h-9 w-9 rounded-md">
            <AvatarFallback className="rounded-md bg-card text-xs font-semibold text-foreground">
              ZD
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">ZODA team</p>
            <p className="truncate text-xs text-muted-foreground">m@zoda.sg</p>
          </div>
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </Link>
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

        <div className="mx-auto w-full max-w-[1540px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/85 px-4 py-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Layers3 className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Campaign command center</p>
              <p className="truncate text-xs text-muted-foreground">
                Tracking activewear demand, drops, and campaign momentum.
              </p>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary">
              Ascend. Conquer. Ascend.
            </Badge>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
