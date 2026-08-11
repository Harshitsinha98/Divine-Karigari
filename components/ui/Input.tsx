import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-soft border border-sand-line bg-parchment px-4 text-sm text-ink outline-none transition placeholder:text-muted-ink/70 focus:border-gold focus:ring-2 focus:ring-gold/20",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
