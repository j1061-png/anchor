"use client";

import type { ReactNode } from "react";
import { useCountUp } from "./hooks/use-count-up";
import { useInView } from "./hooks";

export function GlassCard({
  children,
  className = "",
  accent = "purple",
}: {
  children: ReactNode;
  className?: string;
  accent?: "purple" | "teal" | "coral" | "amber";
}) {
  return (
    <div className={`mkt-glass mkt-glass--${accent} ${className}`}>{children}</div>
  );
}

export function WeaknessPanel({ children }: { children: ReactNode }) {
  return (
    <aside className="mkt-weak" aria-label="Where this is weak">
      <p className="mkt-weak__head">Where this is weak</p>
      <div className="mkt-weak__body">{children}</div>
    </aside>
  );
}

export function CountUpStat({
  value,
  prefix = "",
  suffix = "",
  label,
  sub,
  active,
  accent = "purple",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sub?: string;
  active: boolean;
  accent?: "purple" | "teal" | "coral";
}) {
  const n = useCountUp(value, active, 1400, suffix === "%" ? 0 : 1);
  return (
    <div className={`mkt-stat mkt-stat--${accent}`}>
      <div className="mkt-stat__num">
        {prefix}
        {n}
        {suffix}
      </div>
      <div className="mkt-stat__label">{label}</div>
      {sub ? <div className="mkt-stat__sub">{sub}</div> : null}
    </div>
  );
}

export function RevealSection({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const { ref, visible } = useInView(0.06);
  return (
    <section
      id={id}
      ref={ref}
      className={`mkt-section mkt-section--deck ${visible ? "mkt-section--in" : ""} ${className}`}
    >
      <div className="mkt-section__inner">{children}</div>
    </section>
  );
}
