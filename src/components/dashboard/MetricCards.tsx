import type { MetricCard } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCards({ metrics }: { metrics: MetricCard[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Campaign KPI cards">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
              <Badge className="bg-primary/15 text-primary">{metric.delta}</Badge>
            </div>
            <strong className="mt-3 block text-2xl font-semibold leading-none text-foreground">
              {metric.value}
            </strong>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{metric.note}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
