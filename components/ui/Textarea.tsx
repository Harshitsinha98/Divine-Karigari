import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-32 w-full resize-y rounded-soft border border-sand-line bg-parchment px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted-ink/70 focus:border-gold focus:ring-2 focus:ring-gold/20",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
