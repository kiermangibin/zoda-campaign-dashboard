import type { ActionNote } from "@/types/dashboard";

export function ActionNotes({ actions }: { actions: ActionNote[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-4" aria-label="Manual action notes">
      {actions.map((action) => (
        <article key={action.title} className="zoda-card p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zoda-mint">{action.status}</p>
          <h3 className="mt-3 font-display text-xl font-black uppercase leading-none">{action.title}</h3>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-zoda-muted">{action.detail}</p>
        </article>
      ))}
    </section>
  );
}
