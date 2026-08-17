import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Adds hover lift + press. Use for cards that are links or buttons. */
  interactive?: boolean;
  /** Removes the default padding so a child can bleed to the edges. */
  bare?: boolean;
};

export function Card({
  className = "",
  interactive = false,
  bare = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`card ${interactive ? "card-hover" : ""} ${bare ? "" : "p-5 sm:p-6"} ${className}`}
      {...props}
    />
  );
}

export function CardHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 flex flex-col gap-1.5 ${className}`} {...props} />;
}

export function CardTitle({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`t-section ${className}`} {...props} />;
}

export function CardDescription({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm leading-relaxed text-text-2 ${className}`} {...props} />
  );
}

export function CardFooter({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4 ${className}`}
      {...props}
    />
  );
}

/** Inset panel inside a card — for secondary detail or empty states. */
export function Well({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`well p-4 ${className}`} {...props} />;
}
