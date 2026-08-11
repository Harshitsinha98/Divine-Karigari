import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { ButtonVariant } from "@/types";

const styles: Record<ButtonVariant, string> = {
  primary: "bg-ink text-parchment hover:bg-tulsi focus-visible:ring-ink",
  secondary: "bg-gold text-parchment hover:bg-oxblood focus-visible:ring-gold",
  outline:
    "border border-sand-line bg-transparent text-ink hover:border-gold hover:text-gold focus-visible:ring-gold",
  ghost: "text-ink hover:bg-sand-line/30 focus-visible:ring-gold",
};
export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>(({ className, variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex min-h-11 items-center justify-center gap-2 rounded-soft px-5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:pointer-events-none disabled:opacity-50",
      styles[variant],
      className,
    )}
    {...props}
  />
));
Button.displayName = "Button";
