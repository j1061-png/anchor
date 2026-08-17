import type { ReactNode } from "react";
import { Icon, type IconName } from "./icon";

/**
 * A single headline number. `hint` is where the honest caveat goes — Anchor
 * never shows a metric without saying what it does and does not mean.
 */
export function Stat({
  label,
  value,
  unit,
  hint,
  icon,
  tone = "default",
  className = "",
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: ReactNode;
  icon?: IconName;
  tone?: "default" | "brand" | "green" | "gold" | "cobalt";
  className?: string;
}) {
  const colors: Record<string, string> = {
    default: "text-text",
    brand: "text-brand",
    green: "text-[var(--green)]",
    gold: "text-[var(--gold)]",
    cobalt: "text-[var(--cobalt)]",
  };
  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <Icon name={icon} size={15} className="text-text-3" />}
        <p className="t-eyebrow">{label}</p>
      </div>
      <p className={`num mt-2.5 text-[2rem] leading-none ${colors[tone]}`}>
        {value}
        {unit && (
          <span className="ml-1 text-base font-normal text-text-3">{unit}</span>
        )}
      </p>
      {hint && (
        <p className="mt-2.5 text-xs leading-relaxed text-text-3">{hint}</p>
      )}
    </div>
  );
}

export function StatGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 ${className}`}
    >
      {children}
    </div>
  );
}
