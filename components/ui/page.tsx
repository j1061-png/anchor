import type { ReactNode } from "react";

/**
 * Page scaffolding. Every signed-in page uses these so titles, spacing and
 * max-widths stay identical across the app.
 *
 * width:
 *   "wide"    dashboards and grids (default) — 1152px
 *   "full"    timelines and boards that want the whole screen — 1408px
 *   "focused" one task at a time: a puzzle, a form — 768px
 *   "read"    long prose — 65ch
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  action,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`mb-5 sm:mb-9 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          {eyebrow && <p className="t-eyebrow mb-2">{eyebrow}</p>}
          <h1 className="t-title">{title}</h1>
          {lead && (
            <p className="mt-2.5 max-w-[58ch] text-[0.9375rem] leading-relaxed text-text-2">
              {lead}
            </p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </header>
  );
}

// The shell already caps the outer gutter at 88rem; these narrow within it.
const widths = {
  wide: "max-w-6xl",
  full: "max-w-none",
  focused: "max-w-3xl",
  read: "max-w-[68ch]",
} as const;

export function Page({
  width = "wide",
  className = "",
  children,
}: {
  width?: keyof typeof widths;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full ${widths[width]} ${className}`}>
      {children}
    </div>
  );
}

/** Titled band inside a page, for grouping cards under one heading. */
export function Section({
  title,
  description,
  action,
  className = "",
  children,
}: {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`mt-7 first:mt-0 sm:mt-10 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            {title && <h2 className="t-section">{title}</h2>}
            {description && (
              <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-text-2">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
