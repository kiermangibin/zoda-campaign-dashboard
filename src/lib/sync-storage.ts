import "server-only";
import type { Ga4Summary } from "@/lib/ga4";
import type { GscSummary } from "@/lib/gsc";
import { getSupabaseServerClient } from "@/lib/supabase";

type SyncStorageResult = {
  syncRunId: string;
  rowCount: number;
};

function requireSupabase() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase storage is not configured.");
  }

  return supabase;
}

export async function persistGa4Summary(report: Ga4Summary): Promise<SyncStorageResult> {
  const supabase = requireSupabase();
  const rangeStart = report.rows[0]?.date ?? null;
  const rangeEnd = report.rows.at(-1)?.date ?? null;

  const { data: run, error: runError } = await supabase
    .from("sync_runs")
    .insert({
      source: "ga4",
      status: "synced",
      range_start: rangeStart,
      range_end: rangeEnd,
      row_count: report.rows.length,
      totals: report.totals
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(runError?.message || "GA4 sync run could not be recorded.");
  }

  if (report.rows.length > 0) {
    const { error: rowsError } = await supabase.from("ga4_daily_metrics").upsert(
      report.rows.map((row) => ({
        property_id: report.propertyId,
        metric_date: row.date,
        active_users: row.activeUsers,
        sessions: row.sessions,
        event_count: row.eventCount,
        conversions: row.conversions,
        purchase_revenue: row.purchaseRevenue,
        sync_run_id: run.id,
        raw: row,
        updated_at: new Date().toISOString()
      })),
      { onConflict: "property_id,metric_date" }
    );

    if (rowsError) {
      throw new Error(rowsError.message);
    }
  }

  return {
    syncRunId: run.id,
    rowCount: report.rows.length
  };
}

export async function persistGscSummary(report: GscSummary): Promise<SyncStorageResult> {
  const supabase = requireSupabase();

  const { data: run, error: runError } = await supabase
    .from("sync_runs")
    .insert({
      source: "gsc",
      status: "synced",
      range_start: report.dateRange.startDate,
      range_end: report.dateRange.endDate,
      row_count: report.rows.length,
      totals: report.totals
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(runError?.message || "GSC sync run could not be recorded.");
  }

  if (report.rows.length > 0) {
    const { error: rowsError } = await supabase.from("gsc_query_page_metrics").upsert(
      report.rows.map((row) => ({
        site_url: report.siteUrl,
        range_start: report.dateRange.startDate,
        range_end: report.dateRange.endDate,
        query: row.query,
        page: row.page,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        sync_run_id: run.id,
        raw: row,
        updated_at: new Date().toISOString()
      })),
      { onConflict: "site_url,range_start,range_end,query,page" }
    );

    if (rowsError) {
      throw new Error(rowsError.message);
    }
  }

  return {
    syncRunId: run.id,
    rowCount: report.rows.length
  };
}
