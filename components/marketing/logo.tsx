import Image from "next/image";

type LogoProps = {
  className?: string;
  withTagline?: boolean;
  size?: "sm" | "md" | "lg" | "hero";
  /** Light text for dark backgrounds */
  inverted?: boolean;
};

const MARK: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 28,
  md: 40,
  lg: 72,
  hero: 112,
};

export function MarketingLogo({
  className = "",
  withTagline = false,
  size = "md",
  inverted = false,
}: LogoProps) {
  const mark = MARK[size];
  const stacked = size === "lg" || size === "hero";
  const titleClass =
    size === "hero"
      ? "text-5xl sm:text-6xl"
      : size === "lg"
        ? "text-3xl"
        : size === "sm"
          ? "text-lg"
          : "text-xl";
  const titleColor = inverted ? "text-[var(--mkt-ink)]" : "text-[#0B1F3A]";

  return (
    <div
      className={`inline-flex ${stacked ? "flex-col items-center" : "items-center gap-2"} ${className}`}
    >
      <div
        className={`inline-flex ${stacked ? "flex-col items-center gap-3" : "items-center gap-2"}`}
      >
        <Image
          src="/brand/anchor-mark.svg"
          alt=""
          width={mark}
          height={Math.round(mark * 1.2)}
          priority={size === "hero"}
          className="select-none"
        />
        <span
          className={`font-display font-extrabold tracking-tight ${titleColor} ${titleClass}`}
        >
          Anchor
        </span>
      </div>
      {withTagline ? (
        <p className="mt-3 text-center text-[0.68rem] font-bold uppercase tracking-[0.22em] sm:text-xs">
          <span className={inverted ? "text-[var(--mkt-ink-soft)]" : "text-[#3D4A5C]"}>
            Lock distractions.{" "}
          </span>
          <span className="text-[#6B9BF0]">Anchor your focus.</span>
        </p>
      ) : null}
    </div>
  );
}
