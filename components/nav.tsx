"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { BlockMeter } from "@/components/ui/think-timer";

// Small geometric glyphs in currentColor. The block motif, not icon fonts.
function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden fill="currentColor">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden fill="currentColor">
      <polygon points="10,2 18,10 10,18 2,10" />
    </svg>
  );
}

function BarsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden fill="currentColor">
      <rect x="3" y="10.5" width="4" height="6.5" rx="0.5" />
      <rect x="8" y="5" width="4" height="12" rx="0.5" />
      <rect x="13" y="8" width="4" height="9" rx="0.5" />
    </svg>
  );
}

function PodiumIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden fill="currentColor">
      <rect x="7.5" y="4.5" width="5" height="12.5" rx="0.5" />
      <rect x="2" y="9" width="5" height="8" rx="0.5" />
      <rect x="13" y="12" width="5" height="5" rx="0.5" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden fill="currentColor">
      <circle cx="10" cy="10" r="7" />
    </svg>
  );
}

const TABS = [
  { href: "/today", label: "today", Icon: GridIcon },
  { href: "/practice", label: "practice", Icon: DiamondIcon },
  { href: "/dashboard", label: "dashboard", Icon: BarsIcon },
  { href: "/leaderboard", label: "ranks", Icon: PodiumIcon },
  { href: "/profile", label: "profile", Icon: CircleIcon },
] as const;

export interface NavProps {
  displayName: string;
  avatarEmoji: string | null;
  streak: number;
}

function StreakCounter({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="num text-sm font-semibold">{streak}</span>
      <BlockMeter
        filled={Math.min(16, streak)}
        size="sm"
        label={`${streak} day streak`}
      />
      <span className="text-xs text-slate">day streak</span>
    </div>
  );
}

export function Nav({ displayName, avatarEmoji, streak }: NavProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Mobile: quiet top strip, wordmark + streak. Paper shows through. */}
      <header className="flex h-12 items-center justify-between px-4 sm:hidden">
        <Link href="/today" aria-label="Anchor home">
          <Wordmark />
        </Link>
        <StreakCounter streak={streak} />
      </header>

      {/* Mobile: fixed bottom tab bar. */}
      <nav
        aria-label="Primary"
        className="plane-sm fixed inset-x-3 bottom-3 z-40 sm:hidden"
      >
        <ul className="flex">
          {TABS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 ${
                    active ? "text-ink" : "text-slate"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`size-1 rounded-[1px] ${
                      active ? "bg-flag" : "bg-transparent"
                    }`}
                  />
                  <Icon />
                  <span className="text-[10px] font-semibold leading-none">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* sm+: top bar. Wordmark left, tabs centre, identity + streak right. */}
      <header className="sticky top-0 z-40 hidden border-b border-ink bg-chalk sm:block">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
          <Link href="/today" aria-label="Anchor home">
            <Wordmark />
          </Link>
          <nav aria-label="Primary">
            <ul className="flex items-center gap-1">
              {TABS.map(({ href, label }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-1.5 px-3 text-sm font-semibold ${
                        active ? "text-ink" : "text-slate hover:text-ink"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`size-1.5 rounded-[1px] ${
                          active ? "bg-flag" : "bg-transparent"
                        }`}
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {avatarEmoji ? <span aria-hidden>{avatarEmoji}</span> : null}
              <span className="max-w-28 truncate text-sm font-semibold">
                {displayName}
              </span>
            </div>
            <StreakCounter streak={streak} />
          </div>
        </div>
      </header>
    </>
  );
}
