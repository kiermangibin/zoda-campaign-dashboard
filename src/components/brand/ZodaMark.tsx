import { cn } from "@/lib/utils";

type ZodaMarkProps = {
  compact?: boolean;
  className?: string;
};

export function ZodaMark({ compact = false, className }: ZodaMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/35 bg-primary/15 text-primary shadow-[inset_0_0_24px_rgba(85,205,161,0.12)]">
        <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-sm bg-primary" />
        <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-sm bg-primary" />
        <span className="text-base font-black leading-none tracking-normal">Z</span>
      </span>
      {!compact && (
        <span className="grid gap-1">
          <span className="text-[1.05rem] font-black leading-none tracking-[0.18em] text-foreground">
            ZODA
          </span>
          <span className="text-xs font-medium leading-none text-muted-foreground">
            Campaign intelligence
          </span>
        </span>
      )}
    </span>
  );
}
