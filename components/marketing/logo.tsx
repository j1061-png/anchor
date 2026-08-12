import Image from "next/image";

type LogoProps = {
  className?: string;
  /** Full lockup with tagline, or mark only */
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg" | "hero";
};

const FULL: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 140,
  md: 180,
  lg: 240,
  hero: 300,
};

const MARK = 36;

/** Original Anchor brand lockup (PNG). Mark falls back to SVG crop. */
export function MarketingLogo({
  className = "",
  variant = "full",
  size = "md",
}: LogoProps) {
  if (variant === "mark") {
    return (
      <span
        className={`inline-block overflow-hidden ${className}`}
        style={{ width: MARK, height: MARK }}
        aria-hidden
      >
        <Image
          src="/brand/anchor-logo.png"
          alt=""
          width={MARK * 2.8}
          height={MARK * 3.3}
          className="select-none"
          style={{ objectFit: "cover", objectPosition: "top center", marginTop: -2 }}
          priority
        />
      </span>
    );
  }

  const width = FULL[size];
  const height = Math.round(width * (560 / 480));

  return (
    <Image
      src="/brand/anchor-logo.png"
      alt="Anchor. Lock distractions. Anchor your focus."
      width={width}
      height={height}
      priority={size === "hero"}
      className={`select-none ${className}`}
    />
  );
}
