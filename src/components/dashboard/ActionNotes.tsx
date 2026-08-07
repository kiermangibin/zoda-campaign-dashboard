import type { ActionNote } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ActionNotes({ actions }: { actions: ActionNote[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-4" aria-label="Manual action notes">
      {actions.map((action) => (
        <Card key={action.title} className="border-border bg-card">
          <CardContent className="p-4">
            <Badge variant="outline" className="border-primary/40 text-primary">{action.status}</Badge>
            <h3 className="mt-3 text-sm font-semibold text-foreground">{action.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
