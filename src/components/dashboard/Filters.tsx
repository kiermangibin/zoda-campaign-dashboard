"use client";

import type { RangeKey } from "@/types/dashboard";

interface FiltersProps {
  range: RangeKey;
  campaign: string;
  onRangeChange: (range: RangeKey) => void;
  onCampaignChange: (campaign: string) => void;
}

export function Filters({ range, campaign, onRangeChange, onCampaignChange }: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={range}
        onChange={(event) => onRangeChange(event.target.value as RangeKey)}
        className="border border-zoda-line bg-zoda-panel px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-zoda-text outline-none focus:border-zoda-mint"
        aria-label="Date range"
      >
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </select>
      <select
        value={campaign}
        onChange={(event) => onCampaignChange(event.target.value)}
        className="border border-zoda-line bg-zoda-panel px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-zoda-text outline-none focus:border-zoda-mint"
        aria-label="Campaign"
      >
        <option value="all">All campaigns</option>
        <option value="core">Core performance</option>
        <option value="mab">Mission Athlete Bag</option>
        <option value="seo">SEO growth</option>
      </select>
    </div>
  );
}
