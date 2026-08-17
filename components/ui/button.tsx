import { forwardRef, type ButtonHTMLAttributes } from "react";

/** "quiet" is the old name for "ghost"; kept so existing callers still build. */
type Variant = "primary" | "secondary" | "ghost" | "danger" | "brand" | "quiet";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 font-semibold cursor-pointer select-none " +
  "transition-[transform,background-color,border-color,box-shadow,color] duration-[130ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] " +
  "active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none disabled:active:scale-100";

const variants: Record<Variant, string> = {
  primary:
    "bg-text text-canvas shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-px",
  brand:
    "bg-brand text-[var(--brand-ink)] shadow-[var(--shadow-brand)] hover:brightness-110 hover:-translate-y-px",
  secondary:
    "bg-surface text-text border border-[var(--line-strong)] shadow-[var(--shadow-xs)] " +
    "hover:bg-raised hover:shadow-[var(--shadow-sm)] hover:-translate-y-px",
  ghost: "text-text-2 hover:text-text hover:bg-raised",
  quiet: "text-text-2 hover:text-text hover:bg-raised",
  danger:
    "bg-surface text-brand border border-brand/40 hover:bg-[var(--brand-soft)] hover:border-brand",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem] rounded-[var(--r-sm)]",
  md: "h-11 px-5 text-sm rounded-[var(--r-md)]",
  lg: "h-13 px-7 text-base rounded-[var(--r-md)]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    full = false,
    className = "",
    children,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${variants[variant]} ${sizes[size]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
        />
      )}
      {children}
    </button>
  );
});
