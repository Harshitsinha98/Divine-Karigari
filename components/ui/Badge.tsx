import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-oxblood",
        className,
      )}
      {...props}
    />
  );
}
