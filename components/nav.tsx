"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { Icon, type IconName } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Five destinations, two surfaces.
 *
 * The old nav had twelve links spread over five surfaces, with labels that
 * disagreed with their routes ("Progress" → /independence, "Skill ratings" →
 * /dashboard). Sub-pages now live under the tab they belong to and appear as
 * a SegmentedNav inside that section, so the global chrome stays at five.
 */
type Tab = {
  href: string;
  label: string;
  icon: IconName;
  /** Any route beginning with one of these highlights this tab. */
  owns: string[];
  /** Shown under the label on desktop hover — what the tab is for. */
  blurb: string;
};

export const TABS: Tab[] = [
  {
    href: "/today",
    label: "Today",
    icon: "today",
    owns: ["/today", "/session", "/practice", "/brain-only", "/c/"],
    blurb: "Your five puzzles and anything else due",
  },
  {
    href: "/learn",
    label: "Learn",
    icon: "learn",
    owns: ["/learn"],
    blurb: "Study with the coach that will not answer for you",
  },
  {
    href: "/review",
    label: "Review",
    icon: "review",
    owns: ["/review", "/journal"],
    blurb: "Bring back what has started to fade",
  },
  {
    href: "/progress",
    label: "Progress",
    icon: "progress",
    owns: [
      "/progress",
      "/independence",
      "/dashboard",
      "/leaderboard",
      "/about-the-evidence",
    ],
    blurb: "Your timeline, independence and milestones",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: "profile",
    owns: ["/profile"],
    blurb: "You, your friends and your settings",
  },
];

export interface NavProps {
  displayName: string;
  avatarEmoji: string | null;
  streak: number;
}

function useActiveTab() {
  const pathname = usePathname();
  return (tab: Tab) =>
    tab.owns.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix),
    );
}

/** Days in a row with a real retrieval attempt — not days the app was opened. */
function StreakChip({ streak }: { streak: number }) {
  const lit = streak > 0;
  return (
    <Link
      href="/progress"
      title={`${streak} day retrieval streak — days you turned up and tried to recall something`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors ${
        lit
          ? "border-brand/25 bg-[var(--brand-soft)] text-brand"
          : "border-[var(--line)] bg-raised text-text-3"
      }`}
    >
      <Icon name="flame" size={13} />
      <span className="num">{streak}</span>
      <span className="sr-only">day retrieval streak</span>
    </Link>
  );
}

export function Nav({ displayName, avatarEmoji, streak }: NavProps) {
  const isActive = useActiveTab();

  return (
    <>
      {/* ---- Top bar: identity and global controls, both breakpoints ---- */}
      <header className="glass pt-safe sticky top-0 z-40 border-b border-[var(--line)]">
        <div className="mx-auto flex h-14 w-full max-w-[88rem] items-center gap-3 px-4 sm:h-16 sm:px-6">
          <Link
            href="/today"
            aria-label="Anchor home"
            className="shrink-0 transition-opacity hover:opacity-70"
          >
            <Wordmark />
          </Link>

          {/* Desktop tabs sit centre. */}
          <nav aria-label="Primary" className="mx-auto hidden sm:block">
            <ul className="flex items-center gap-1">
              {TABS.map((tab) => {
                const active = isActive(tab);
                return (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      aria-current={active ? "page" : undefined}
                      title={tab.blurb}
                      className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-[130ms] ${
                        active
                          ? "bg-text text-canvas shadow-[var(--shadow-xs)]"
                          : "text-text-2 hover:bg-raised hover:text-text"
                      }`}
                    >
                      <Icon name={tab.icon} size={17} />
                      {tab.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
            <StreakChip streak={streak} />
            <ThemeToggle />
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-raised sm:pr-3"
              title="Your profile"
            >
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-full bg-raised text-base ring-1 ring-[var(--line)]"
              >
                {avatarEmoji ?? "🙂"}
              </span>
              <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">
                {displayName}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ---- Mobile: fixed bottom tab bar ---- */}
      <nav
        aria-label="Primary"
        className="bottom-safe glass fixed inset-x-3 z-40 rounded-[var(--r-lg)] border border-[var(--line)] shadow-[var(--shadow-lg)] sm:hidden"
      >
        <ul className="flex">
          {TABS.map((tab) => {
            const active = isActive(tab);
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-15 flex-col items-center justify-center gap-1 py-2 transition-colors ${
                    active ? "text-brand" : "text-text-3"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-brand"
                    />
                  )}
                  <Icon name={tab.icon} size={21} />
                  <span className="text-[0.625rem] font-bold leading-none tracking-wide">
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
