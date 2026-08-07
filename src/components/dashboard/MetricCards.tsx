import type { MetricCard } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCards({ metrics }: { metrics: MetricCard[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7" aria-label="Performance metrics">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-border bg-card/95">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{metric.label}</p>
              <Badge variant="outline" className="border-border bg-background text-muted-foreground">{metric.delta}</Badge>
            </div>
            <strong className="mt-4 block text-3xl font-semibold leading-none tracking-tight text-foreground">
              {metric.value}
            </strong>
            <p className="mt-3 truncate text-xs text-muted-foreground">{metric.note}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
