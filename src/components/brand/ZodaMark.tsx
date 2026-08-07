import Image from "next/image";
import { cn } from "@/lib/utils";

type ZodaMarkProps = {
  compact?: boolean;
  className?: string;
};

export function ZodaMark({ compact = false, className }: ZodaMarkProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <span
        className={cn(
          "relative block overflow-hidden",
          compact ? "h-8 w-11" : "h-[34px] w-[180px]"
        )}
      >
        <Image
          src="/brand/zoda-logo.png"
          alt="ZODA"
          width={400}
          height={75}
          priority
          className={cn("absolute left-0 top-0 h-full max-w-none object-contain", compact ? "w-[168px] object-left" : "w-full")}
        />
      </span>
    </span>
  );
}
