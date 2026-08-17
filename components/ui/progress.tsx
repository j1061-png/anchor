type BarProps = {
  /** 0–1 */
  value: number;
  className?: string;
  /** CSS colour for the fill. Defaults to the brand colour. */
  color?: string;
  label?: string;
};

export function ProgressBar({
  value,
  className = "",
  color = "var(--brand)",
  label,
}: BarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-sunken ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-[width] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

type RingProps = {
  /** 0–1 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  className?: string;
  label?: string;
  children?: React.ReactNode;
};

/** Circular progress with a slot in the middle for a number. */
export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  color = "var(--brand)",
  trackColor = "var(--sunken)",
  className = "",
  label,
  children,
}: RingProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={`relative inline-grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{
            transition:
              "stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
