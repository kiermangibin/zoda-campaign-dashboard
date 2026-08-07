"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CircleDot,
  Database,
  Gauge,
  Layers3,
  LogIn,
  Menu,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserRound
} from "lucide-react";
import { ZodaMark } from "@/components/brand/ZodaMark";
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
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent() {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-6">
        <Link href="/dashboard" aria-label="ZODA dashboard home">
          <ZodaMark />
        </Link>
      </div>

      <div className="px-3">
        <NavigationLinks />
      </div>

      <div className="mt-5 px-5">
        <Separator />
      </div>

      <div className="grid gap-3 p-5 pt-4">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Access
            </span>
            <Badge className="bg-primary/15 text-primary">Active</Badge>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Google auth is limited to approved @zoda.sg accounts.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Database className="h-4 w-4 text-primary" />
            Data sources
          </div>
          <div className="mt-3 grid gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-foreground">
                <CircleDot className="h-3 w-3 text-primary" />
                Google
              </span>
              <span className="text-muted-foreground">ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-foreground">
                <CircleDot className="h-3 w-3 text-yellow-300" />
                Shopify
              </span>
              <span className="text-muted-foreground">token needed</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-foreground">
                <CircleDot className="h-3 w-3 text-yellow-300" />
                Supabase
              </span>
              <span className="text-muted-foreground">planned</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-5">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <UserRound className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">ZODA team</p>
              <p className="truncate text-xs text-muted-foreground">Private workspace</p>
            </div>
          </div>
        </div>
        <Link
          href="/login"
          className="mt-3 flex h-10 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <LogIn className="h-4 w-4" />
          Account access
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
