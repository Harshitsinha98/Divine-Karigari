import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-soft-xl border border-sand-line bg-parchment shadow-soft",
        className,
      )}
      {...props}
    />
  );
}
