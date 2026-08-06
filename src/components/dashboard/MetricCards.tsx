import type { MetricCard } from "@/types/dashboard";

export function MetricCards({ metrics }: { metrics: MetricCard[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Campaign KPI cards">
      {metrics.map((metric) => (
        <article key={metric.label} className="zoda-card p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zoda-muted">{metric.label}</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <strong className="font-display text-3xl font-black uppercase leading-none text-zoda-text">
              {metric.value}
            </strong>
            <span className="bg-zoda-mint px-2 py-1 text-xs font-black text-zoda-black">{metric.delta}</span>
          </div>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-zoda-muted">{metric.note}</p>
        </article>
      ))}
    </section>
  );
}
