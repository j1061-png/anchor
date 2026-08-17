import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";

// Shared shapes and presentational pieces for the leaderboard. No hooks here;
// everything renders on the server. Tab state lives in the URL (?tab=&page=).
//
// There is no streak column. Every row used to be built with `streak: 0`
// hardcoded in page.tsx, so the board rendered a column of permanent zeroes and
// told screen readers "0 day streak" about everyone. Neither board view carries
// a streak, so rather than invent one the column is gone; recall days live on
// Today and on the profile, where the number is real.

export const PAGE_SIZE = 50;

// RESEARCH-SPEC R3: absolute top-score boards are on the Do-Not-Build list
// (they demotivate low and median performers — Hanus & Fox 2015). The boards
// that survive are improvement and independence, opt-in and skill-banded.
export const LEADERBOARD_TABS = ["improved", "independence", "friends"] as const;
export type LeaderboardTab = (typeof LEADERBOARD_TABS)[number];

export interface BoardRow {
  id: string;
  rank: number;
  name: string;
  avatarEmoji: string | null;
  metric: number;
}

function Row({
  row,
  highlight,
  metricLabel,
}: {
  row: BoardRow;
  highlight: boolean;
  metricLabel: string;
}) {
  return (
    <li
      aria-label={`rank ${row.rank}: ${row.name}, ${metricLabel} ${row.metric}${highlight ? ", you" : ""}`}
      className={`flex min-h-14 items-center gap-3 px-4 ${
        highlight
          ? "bg-[var(--brand-soft)]"
          : "border-b border-[var(--line)] last:border-b-0"
      }`}
    >
      <span
        aria-hidden
        className={`num w-8 shrink-0 text-right text-xs ${
          row.rank <= 3 ? "font-semibold text-text" : "text-text-3"
        }`}
      >
        {row.rank}
      </span>

      <Avatar token={row.avatarEmoji} size={36} />

      <span
        aria-hidden
        className="min-w-0 flex-1 truncate text-sm font-semibold"
      >
        {row.name}
        {highlight && (
          <span className="ml-2 text-xs font-semibold text-brand">you</span>
        )}
      </span>

      <span aria-hidden className="num w-20 shrink-0 text-right text-sm font-semibold">
        {row.metric}
        <span className="ml-0.5 text-xs font-normal text-text-3">
          {metricLabel}
        </span>
      </span>
    </li>
  );
}

export function Board({
  rows,
  pinned,
  meId,
  metricLabel,
}: {
  rows: BoardRow[];
  pinned: BoardRow | null;
  meId: string;
  metricLabel: string;
}) {
  return (
    <div className="card overflow-hidden p-0">
      <div
        aria-hidden
        className="t-eyebrow flex items-center gap-3 border-b border-[var(--line)] bg-raised px-4 py-2.5"
      >
        <span className="w-8 shrink-0 text-right">#</span>
        <span className="size-9 shrink-0" />
        <span className="min-w-0 flex-1">name</span>
        <span className="w-20 shrink-0 text-right">{metricLabel}</span>
      </div>
      <ol aria-label={`ranked by ${metricLabel}`}>
        {rows.map((r) => (
          <Row
            key={r.id}
            row={r}
            highlight={r.id === meId}
            metricLabel={metricLabel}
          />
        ))}
      </ol>
      {pinned && (
        <div className="border-t border-dashed border-[var(--line-strong)]">
          <ol aria-label="your rank">
            <Row row={pinned} highlight metricLabel={metricLabel} />
          </ol>
        </div>
      )}
    </div>
  );
}

export function Pager({
  tab,
  page,
  total,
}: {
  tab: LeaderboardTab;
  page: number;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1 && page <= 1) return null;

  const live =
    "inline-flex min-h-11 items-center gap-1.5 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-surface px-4 text-sm font-semibold shadow-[var(--shadow-xs)] transition-colors hover:bg-raised";
  const dead =
    "inline-flex min-h-11 items-center gap-1.5 rounded-[var(--r-sm)] border border-[var(--line)] px-4 text-sm font-semibold text-text-3 opacity-50";
  const href = (p: number) => `/leaderboard?tab=${tab}&page=${p}`;

  return (
    <nav
      aria-label="Leaderboard pages"
      className="mt-4 flex items-center justify-between gap-3"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} scroll={false} className={live}>
          <Icon name="chevronRight" size={14} className="rotate-180" />
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={dead}>
          Previous
        </span>
      )}
      <span className="text-xs text-text-3">
        page <span className="num">{page}</span> of{" "}
        <span className="num">{pages}</span>
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} scroll={false} className={live}>
          Next
          <Icon name="chevronRight" size={14} />
        </Link>
      ) : (
        <span aria-disabled="true" className={dead}>
          Next
        </span>
      )}
    </nav>
  );
}
