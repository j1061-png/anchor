import type { HTMLAttributes } from "react";
import { Icon, type IconName } from "./icon";

type Tone = "neutral" | "brand" | "green" | "amber" | "cobalt" | "gold";

const tones: Record<Tone, string> = {
  neutral: "bg-raised text-text-2 border-[var(--line)]",
  brand: "bg-[var(--brand-soft)] text-brand border-brand/25",
  green:
    "bg-[color-mix(in_oklab,var(--green)_14%,transparent)] text-[var(--green)] border-[color-mix(in_oklab,var(--green)_32%,transparent)]",
  amber:
    "bg-[color-mix(in_oklab,var(--amber)_14%,transparent)] text-[var(--amber)] border-[color-mix(in_oklab,var(--amber)_32%,transparent)]",
  cobalt:
    "bg-[color-mix(in_oklab,var(--cobalt)_14%,transparent)] text-[var(--cobalt)] border-[color-mix(in_oklab,var(--cobalt)_32%,transparent)]",
  gold: "bg-[color-mix(in_oklab,var(--gold)_18%,transparent)] text-[var(--gold)] border-[color-mix(in_oklab,var(--gold)_38%,transparent)]",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: IconName;
}

export function Badge({
  tone = "neutral",
  icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
