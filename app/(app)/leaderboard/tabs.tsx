"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { LEADERBOARD_TABS, type LeaderboardTab } from "./board";

// Which board. The active tab lives in the URL so the server fetches per tab;
// this component only reflects it. Visually it matches <SegmentedNav>, which
// cannot be reused directly because that one keys off the pathname.

const LABELS: Record<LeaderboardTab, string> = {
  improved: "Most improved",
  independence: "Independence",
  friends: "Friends",
};

const ICONS: Record<LeaderboardTab, IconName> = {
  improved: "progress",
  independence: "brainOnly",
  friends: "users",
};

export function LeaderboardTabs() {
  const params = useSearchParams();
  const raw = params.get("tab") ?? "improved";
  const active: LeaderboardTab = (
    LEADERBOARD_TABS as readonly string[]
  ).includes(raw)
    ? (raw as LeaderboardTab)
    : "improved";

  return (
    <nav
      aria-label="Board"
      className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      <div className="inline-flex min-w-full gap-1 rounded-[var(--r-md)] border border-[var(--line)] bg-surface p-1 shadow-[var(--shadow-xs)] sm:min-w-0">
        {LEADERBOARD_TABS.map((tab) => {
          const current = tab === active;
          return (
            <Link
              key={tab}
              href={`/leaderboard?tab=${tab}`}
              scroll={false}
              aria-current={current ? "page" : undefined}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--r-sm)] px-3.5 py-2 text-[0.8125rem] font-semibold transition-all duration-[130ms] sm:flex-initial ${
                current
                  ? "bg-text text-canvas shadow-[var(--shadow-xs)]"
                  : "text-text-2 hover:bg-raised hover:text-text"
              }`}
            >
              <Icon name={ICONS[tab]} size={15} />
              {LABELS[tab]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
