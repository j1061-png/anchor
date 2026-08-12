"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/wordmark";
import { BlockMeter } from "@/components/ui/think-timer";

function TrainIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3L3 8l9 5 9-5-9-5z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 16l9 5 9-5" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 20h18" />
      <path d="M6 20V10" />
      <path d="M12 20V4" />
      <path d="M18 20v-8" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

const PRIMARY = [
  { href: "/today", label: "Train", Icon: TrainIcon, desc: "Daily brain work" },
  { href: "/learn", label: "Learn", Icon: LearnIcon, desc: "Attempt first" },
  { href: "/independence", label: "Progress", Icon: ProgressIcon, desc: "Your growth" },
  { href: "/profile", label: "You", Icon: ProfileIcon, desc: "Profile & share" },
] as const;

const MORE = [
  { href: "/review", label: "Review", desc: "Spaced retrieval" },
  { href: "/practice", label: "Practice", desc: "Extra puzzles" },
  { href: "/brain-only", label: "Brain-only", desc: "No AI allowed" },
  { href: "/journal", label: "Error journal", desc: "Learn from mistakes" },
  { href: "/dashboard", label: "Skill ratings", desc: "Category levels" },
  { href: "/leaderboard", label: "Most improved", desc: "Class rankings" },
  { href: "/about-the-evidence", label: "The evidence", desc: "Research behind Anchor" },
] as const;

export interface NavProps {
  displayName: string;
  avatarEmoji: string | null;
  streak: number;
}

function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-2 rounded-(--radius-pill) bg-mist/60 px-3 py-1.5">
      <BlockMeter filled={Math.min(16, streak)} size="sm" label={`${streak} retrieval days`} />
      <span className="num text-sm font-semibold">{streak}</span>
      <span className="hidden text-xs text-slate sm:inline">recall days</span>
    </div>
  );
}

function isRouteActive(pathname: string, href: string) {
  if (href === "/today") {
    return (
      pathname === "/today" ||
      pathname.startsWith("/session") ||
      pathname === "/practice"
    );
  }
  if (href === "/independence") {
    return pathname === "/independence" || pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav({ displayName, avatarEmoji, streak }: NavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-(--radius-ctl) px-3 py-2.5 text-sm font-semibold transition-colors ${
      active
        ? "bg-accent text-chalk shadow-sm"
        : "text-slate hover:bg-mist/80 hover:text-ink"
    }`;

  return (
    <>
      {/* Mobile top bar */}
      <header className="flex h-14 items-center justify-between px-4 lg:hidden">
        <Link href="/today" aria-label="Anchor home">
          <Wordmark />
        </Link>
        <StreakBadge streak={streak} />
      </header>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Primary"
        className="plane-glass fixed inset-x-4 bottom-4 z-40 lg:hidden"
      >
        <ul className="flex">
          {PRIMARY.map(({ href, label, Icon }) => {
            const active = isRouteActive(pathname, href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 py-2 ${
                    active ? "text-accent" : "text-slate"
                  }`}
                >
                  <Icon />
                  <span className="text-[10px] font-semibold leading-none">{label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-label="More destinations"
              className={`flex min-h-14 w-full flex-col items-center justify-center gap-0.5 py-2 ${
                moreOpen ? "text-accent" : "text-slate"
              }`}
            >
              <MoreIcon />
              <span className="text-[10px] font-semibold leading-none">More</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile more sheet */}
      {moreOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div className="plane fixed inset-x-4 bottom-20 z-50 max-h-[60vh] overflow-y-auto p-3 lg:hidden deal-in">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate">
              More tools
            </p>
            <ul className="grid gap-1">
              {MORE.map(({ href, label, desc }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col rounded-(--radius-ctl) px-3 py-2.5 hover:bg-mist/60"
                  >
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-xs text-slate">{desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-ink/8 lg:bg-chalk/80 lg:backdrop-blur-xl">
        <div className="flex h-16 items-center px-5">
          <Link href="/today" aria-label="Anchor home">
            <Wordmark />
          </Link>
        </div>

        <nav aria-label="Primary" className="flex-1 space-y-1 px-3">
          {PRIMARY.map(({ href, label, Icon, desc }) => {
            const active = isRouteActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={linkClass(active)}
              >
                <Icon />
                <div className="flex flex-col">
                  <span>{label}</span>
                  {!active && (
                    <span className="text-[11px] font-normal opacity-70">{desc}</span>
                  )}
                </div>
              </Link>
            );
          })}

          <div className="my-4 border-t border-ink/8 pt-4">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate">
              More
            </p>
            {MORE.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-(--radius-ctl) px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-mist text-ink" : "text-slate hover:bg-mist/60 hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-ink/8 p-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-full bg-mist text-lg"
            >
              {avatarEmoji ?? displayName.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <StreakBadge streak={streak} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
