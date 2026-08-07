"use client";

import type { RangeKey } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FiltersProps {
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
}

const ranges: Array<{ label: string; value: RangeKey }> = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" }
];

export function Filters({ range, onRangeChange }: FiltersProps) {
  return (
    <div className="flex rounded-md border border-border bg-card p-1" aria-label="Date range">
      {ranges.map((item) => {
        const isActive = item.value === range;

        return (
          <Button
            key={item.value}
            type="button"
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 px-3 text-xs",
              isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground"
            )}
            aria-pressed={isActive}
            onClick={() => onRangeChange(item.value)}
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
