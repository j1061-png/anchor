"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icon";

export type Segment = { href: string; label: string; icon?: IconName };

/**
 * Sub-navigation inside a section (Progress, Review, Today). Replaces the old
 * app-wide secondary strip: sub-pages now live under the tab they belong to
 * instead of floating on every screen.
 */
export function SegmentedNav({
  items,
  className = "",
}: {
  items: Segment[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Section"
      className={`no-scrollbar -mx-4 mb-7 overflow-x-auto px-4 sm:mx-0 sm:px-0 ${className}`}
    >
      <div className="inline-flex min-w-full gap-1 rounded-[var(--r-md)] border border-[var(--line)] bg-surface p-1 shadow-[var(--shadow-xs)] sm:min-w-0">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--r-sm)] px-3.5 py-2 text-[0.8125rem] font-semibold transition-all duration-[130ms] sm:flex-initial ${
                active
                  ? "bg-text text-canvas shadow-[var(--shadow-xs)]"
                  : "text-text-2 hover:bg-raised hover:text-text"
              }`}
            >
              {item.icon && <Icon name={item.icon} size={15} />}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
