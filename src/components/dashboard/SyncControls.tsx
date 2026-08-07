"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Play, ShieldCheck, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SyncSource = "GA4" | "GSC" | "Shopify";

type SyncTarget = {
  source: SyncSource;
  label: string;
  description: string;
  endpoint: string;
};

type SyncState = {
  status: "idle" | "running" | "success" | "error";
  message: string;
  rowCount?: number;
};

const targets: SyncTarget[] = [
  {
    source: "GA4",
    label: "GA4",
    description: "Refresh daily website activity and event totals.",
    endpoint: "/api/sync/ga4"
  },
  {
    source: "GSC",
    label: "Search Console",
    description: "Refresh query/page search opportunity rows.",
    endpoint: "/api/sync/gsc"
  },
  {
    source: "Shopify",
    label: "Shopify",
    description: "Refresh recent order revenue and fulfillment status.",
    endpoint: "/api/sync/shopify"
  }
];

function initialState(): Record<SyncSource, SyncState> {
  return {
    GA4: { status: "idle", message: "Ready to sync" },
    GSC: { status: "idle", message: "Ready to sync" },
    Shopify: { status: "idle", message: "Not connected" }
  };
}

function statusClass(status: SyncState["status"]) {
  if (status === "success") return "border-primary/40 bg-primary/10 text-primary";
  if (status === "error") return "border-red-400/40 bg-red-400/10 text-red-200";
  if (status === "running") return "border-sky-300/40 bg-sky-300/10 text-sky-200";
  return "border-border bg-background text-muted-foreground";
}

export function SyncControls({
  shopifyReady,
  shopifyConfigured
}: {
  shopifyReady: boolean;
  shopifyConfigured: boolean;
}) {
  const [state, setState] = useState(initialState);

  async function runSync(target: SyncTarget) {
    if (target.source === "Shopify" && !shopifyReady) return;

    setState((current) => ({
      ...current,
      [target.source]: { status: "running", message: "Syncing..." }
    }));

    try {
      const response = await fetch(target.endpoint, { method: "POST" });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        storage?: { rowCount?: number };
        status?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || payload.status || `${target.label} sync failed.`);
      }

      const rowCount = payload.storage?.rowCount;

      setState((current) => ({
        ...current,
        [target.source]: {
          status: "success",
          message: rowCount === undefined ? "Synced successfully" : `Synced ${rowCount} rows`,
          rowCount
        }
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        [target.source]: {
          status: "error",
          message: error instanceof Error ? error.message : `${target.label} sync failed.`
        }
      }));
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Manual sync</CardTitle>
            <CardDescription>
              Pull fresh source data into Supabase without leaving the dashboard.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/40 text-primary">
            Protected action
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-3">
        {targets.map((target) => {
          const itemState = state[target.source];
          const isRunning = itemState.status === "running";
          const isError = itemState.status === "error";
          const isShopifyPending = target.source === "Shopify" && !shopifyReady;
          const isDisabled = target.source === "Shopify" && !shopifyReady;

          return (
            <div key={target.source} className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{target.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{target.description}</p>
                </div>
                <Badge variant="outline" className={cn("shrink-0", statusClass(itemState.status))}>
                  {isDisabled ? "Disabled" : itemState.status}
                </Badge>
              </div>

              <Alert
                className={cn(
                  "mt-3",
                  isError ? "border-red-400/30 bg-red-400/10" : "border-border bg-card"
                )}
              >
                {isError ? (
                  <TriangleAlert className="h-4 w-4 text-red-200" />
                ) : itemState.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <Play className="h-4 w-4 text-muted-foreground" />
                )}
                <AlertTitle>{itemState.message}</AlertTitle>
                <AlertDescription>
                  {isDisabled
                    ? shopifyConfigured
                      ? "Install the Shopify app to grant Admin API access."
                      : "Add Shopify app credentials before enabling this sync."
                    : "Runs server-side with the signed-in ZODA session."}
                </AlertDescription>
              </Alert>

              {isShopifyPending && shopifyConfigured ? (
                <a className={cn(buttonVariants(), "mt-3 w-full")} href="/api/shopify/install">
                  <ShieldCheck />
                  Connect Shopify
                </a>
              ) : (
                <Button
                  type="button"
                  className="mt-3 w-full"
                  variant={isDisabled ? "secondary" : "default"}
                  disabled={isDisabled || isRunning}
                  onClick={() => void runSync(target)}
                >
                  {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
                  Sync {target.label}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
