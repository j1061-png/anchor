"use client";

import type { ReactNode } from "react";
import { useInView } from "./hooks";

export function Section({
  id,
  children,
  className = "",
  dark = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  const { ref, visible } = useInView(0.08);
  return (
    <section
      id={id}
      ref={ref}
      className={`mkt-section ${dark ? "mkt-section--dark" : ""} ${visible ? "mkt-section--in" : ""} ${className}`}
    >
      <div className="mkt-section__inner">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mkt-eyebrow">{children}</p>;
}

export function Headline({
  children,
  as: Tag = "h2",
  className = "",
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return <Tag className={`mkt-headline ${className}`}>{children}</Tag>;
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="mkt-lead">{children}</p>;
}

export function PhoneFrame({
  children,
  className = "",
  label = "Phone",
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`mkt-phone ${className}`} aria-label={label}>
      <div className="mkt-phone__bezel">
        <div className="mkt-phone__island" aria-hidden />
        <div className="mkt-phone__screen">{children}</div>
      </div>
    </div>
  );
}
