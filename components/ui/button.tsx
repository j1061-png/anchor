import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "quiet" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "rounded-(--radius-pill) bg-accent text-chalk font-semibold px-6 py-3 border border-accent " +
    "shadow-sm hover:bg-accent/90 hover:shadow-md active:scale-[0.98] " +
    "disabled:opacity-40 disabled:pointer-events-none transition-all duration-200",
  secondary:
    "rounded-(--radius-ctl) bg-chalk text-ink font-semibold px-4 py-2.5 border border-ink/10 " +
    "shadow-sm hover:bg-mist/60 hover:border-ink/15 active:scale-[0.98] " +
    "disabled:opacity-40 disabled:pointer-events-none transition-all duration-200",
  quiet:
    "rounded-(--radius-ctl) text-ink font-semibold px-3 py-2 " +
    "hover:bg-mist/60 disabled:opacity-40 disabled:pointer-events-none transition-colors",
  danger:
    "rounded-(--radius-ctl) bg-chalk text-flag font-semibold px-4 py-2.5 border border-flag/30 " +
    "hover:bg-flag/5 disabled:opacity-40 disabled:pointer-events-none transition-colors",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", className = "", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 text-sm cursor-pointer ${styles[variant]} ${className}`}
        {...props}
      />
    );
  },
);
