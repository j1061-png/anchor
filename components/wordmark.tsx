import { LogoIcon } from "@/components/logo-icon";

type WordmarkVariant = "compact" | "full";

/** Anchor brand lockup — icon + name, optional tagline. */
export function Wordmark({
  className = "",
  variant = "compact",
}: {
  className?: string;
  variant?: WordmarkVariant;
}) {
  const iconSize = variant === "full" ? "size-12 sm:size-14" : "size-8";

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${variant === "full" ? "flex-col text-center sm:flex-row sm:text-left" : ""} ${className}`}
    >
      <LogoIcon className={`${iconSize} shrink-0`} />
      <span className={variant === "full" ? "flex flex-col" : "inline-flex flex-col justify-center"}>
        <span className="font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          Anchor
        </span>
        {variant === "full" && (
          <span className="mt-0.5 max-w-xs text-[10px] font-semibold uppercase leading-snug tracking-wide sm:text-[11px]">
            <span className="text-ink">Lock distractions. </span>
            <span className="text-accent">Anchor your focus.</span>
          </span>
        )}
      </span>
    </span>
  );
}
