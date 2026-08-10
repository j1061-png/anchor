"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MarketingLogo } from "./logo";

const LINKS = [
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
] as const;

export function MarketingSiteNav() {
  const pathname = usePathname();

  return (
    <nav className="mkt-nav" aria-label="Site">
      <Link href="/" className="mkt-nav__brand">
        <MarketingLogo variant="mark" size="sm" />
        <span className="sr-only">Anchor home</span>
      </Link>
      <div className="mkt-nav__links">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`mkt-nav__link ${pathname === href || pathname.startsWith(`${href}/`) ? "mkt-nav__link--active" : ""}`}
          >
            {label}
          </Link>
        ))}
        <Link href="/auth?mode=signup" className="mkt-nav__cta">
          Start training
        </Link>
      </div>
    </nav>
  );
}
