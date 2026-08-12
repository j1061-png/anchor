"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Wordmark } from "@/components/wordmark";

function TrainIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" strokeLinejoin="round" />
    </svg>
  );
}

function LearnIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 3L3 8l9 5 9-5-9-5z" />
      <path d="M3 12l9 5 9-5M3 16l9 5 9-5" />
    </svg>
  );
}

function ProgressIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 20h18M6 20V10M12 20V4M18 20v-8" strokeLinecap="round" />
    </svg>
  );
}

function LeaderboardIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <path d="M16 6l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

const NAV = [
  { href: "/today", label: "Train", Icon: TrainIcon },
  { href: "/learn", label: "Learn", Icon: LearnIcon },
  { href: "/independence", label: "Progress", Icon: ProgressIcon },
  { href: "/leaderboard", label: "Ranks", Icon: LeaderboardIcon },
  { href: "/profile", label: "You", Icon: ProfileIcon },
] as const;

export interface NavProps {
  displayName: string;
  avatarEmoji: string | null;
  streak: number;
}

function isActive(pathname: string, href: string) {
  if (href === "/today") {
    return pathname === "/today" || pathname.startsWith("/session") || pathname === "/practice";
  }
  if (href === "/independence") {
    return pathname === "/independence" || pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav({ displayName, avatarEmoji, streak }: NavProps) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/today" aria-label="Anchor home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-3">
          <span className="num hidden rounded-(--radius-pill) bg-chalk/80 px-3 py-1 text-xs font-semibold text-navy shadow-sm sm:inline">
            {streak} recall days
          </span>
          <Link href="/profile" aria-label="Your profile">
            <Avatar avatarId={avatarEmoji} name={displayName} size="sm" />
          </Link>
        </div>
      </header>

      {/* Floating pill nav — xedu-style */}
      <nav
        aria-label="Primary"
        className="float-pill fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-0.5 px-2 py-2"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={label}
              className={`flex min-h-11 min-w-11 flex-col items-center justify-center rounded-(--radius-pill) px-3 py-2 transition-all ${
                active
                  ? "bg-navy text-white shadow-md"
                  : "text-slate hover:bg-mist/80 hover:text-navy"
              }`}
            >
              <Icon className="size-5" />
              <span className="mt-0.5 text-[9px] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
