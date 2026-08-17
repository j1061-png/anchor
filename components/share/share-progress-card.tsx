"use client";

/**
 * The share-progress surface.
 *
 * Anchor's position on sharing (lib/why.ts → `sharing`) is that a shared card
 * should carry effort, not output: work finished with no help, days of recall
 * practice, sessions run with the assistance absent, milestones reached. So
 * this card previews exactly that, live, and hands the finished image to the
 * existing <ShareButton>.
 *
 * Two small controls, no wizard: which window, and whether the recall streak
 * rides along. The preview is built from the same counts the image route
 * reads, so what you see is what gets posted — drawn in app tokens here so it
 * works in both themes, and in the card's fixed palette once rendered.
 */

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { WhyThis } from "@/components/ui/why-this";
import { Wordmark } from "@/components/wordmark";
import {
  RANGE_LABEL,
  RANGE_TAB,
  SHARE_RANGES,
  shareCaption,
  type ProgressStats,
  type ShareRange,
} from "@/lib/share";
import { ShareButton } from "./share-button";

export interface ShareProgressCardProps {
  userId: string;
  displayName: string;
  /** Counts for both windows, so switching the control needs no round trip. */
  stats: Record<ShareRange, ProgressStats>;
  /** profiles.leaderboard_opt_in — the gate the image route enforces. */
  optedIn: boolean;
  friendCode?: string;
  siteUrl: string;
  className?: string;
}

function Tile({
  value,
  label,
  tone = "default",
}: {
  value: number | string;
  label: string;
  tone?: "default" | "brand" | "gold";
}) {
  const colors = {
    default: "text-text",
    brand: "text-brand",
    gold: "text-[var(--gold)]",
  } as const;
  return (
    <div className="flex flex-col rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-surface px-3 py-2.5">
      <span className={`num text-xl leading-none ${colors[tone]}`}>{value}</span>
      <span className="mt-1.5 text-[0.6875rem] leading-tight text-text-3">
        {label}
      </span>
    </div>
  );
}

/** A faithful, themed rendering of the 1080×1080 image about to be shared. */
function Preview({
  name,
  range,
  stats,
  includeStreak,
}: {
  name: string;
  range: ShareRange;
  stats: ProgressStats;
  includeStreak: boolean;
}) {
  const pct =
    stats.finished > 0
      ? Math.max(3, Math.round((stats.unaidedSolves / stats.finished) * 100))
      : 0;

  return (
    <div
      aria-label="Preview of the image that will be shared"
      className="grid-bg flex aspect-square w-full max-w-[25rem] flex-col justify-between rounded-[var(--r-lg)] border border-[var(--line-strong)] bg-canvas p-5 shadow-[var(--shadow-sm)] sm:p-6"
    >
      <Wordmark />

      <div className="flex flex-col">
        <p className="truncate text-xs text-text-2">
          {name} · {RANGE_LABEL[range]}
        </p>

        <div className="mt-1 flex items-baseline gap-2.5">
          <span className="num text-[3.25rem] leading-none sm:text-6xl">
            {stats.unaidedSolves}
          </span>
          <span className="font-display text-lg leading-tight font-extrabold sm:text-xl">
            solved
            <br />
            <span className="text-brand">unaided</span>
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-text-2">
          {stats.finished > 0
            ? `out of ${stats.finished} finished — no hint, no worked solution`
            : "no items finished in this window yet"}
        </p>

        {stats.finished > 0 && (
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full border border-[var(--line-strong)] bg-sunken">
            <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {includeStreak && (
            <Tile
              value={stats.recallDays}
              label={stats.recallDays === 1 ? "day of recall" : "days of recall"}
              tone="brand"
            />
          )}
          {stats.brainOnly !== null && (
            <Tile
              value={stats.brainOnly}
              label={
                stats.brainOnly === 1
                  ? "brain-only session"
                  : "brain-only sessions"
              }
            />
          )}
          <Tile
            value={stats.milestones}
            label={stats.milestones === 1 ? "milestone" : "milestones"}
            tone="gold"
          />
        </div>
      </div>

      <p className="text-[0.6875rem] text-text-3">
        Five puzzles a day. No help for the first 45 seconds.
      </p>
    </div>
  );
}

export function ShareProgressCard({
  userId,
  displayName,
  stats,
  optedIn,
  friendCode,
  siteUrl,
  className = "",
}: ShareProgressCardProps) {
  const [range, setRange] = useState<ShareRange>("week");
  const [includeStreak, setIncludeStreak] = useState(true);

  const current = stats[range];
  const everFinished = stats.all.finished > 0;

  const imageUrl = `/api/share/progress/${userId}?range=${range}&streak=${
    includeStreak ? "1" : "0"
  }`;

  return (
    <Card className={className} id="share-progress">
      <CardHeader>
        <CardTitle>Share your progress</CardTitle>
        <CardDescription>
          A square card of what you did without help. Pick the window, choose
          whether your recall days come along, and send the picture.
        </CardDescription>
      </CardHeader>

      {!optedIn ? (
        <div className="well flex flex-col gap-3 p-4">
          <div className="flex items-start gap-2.5">
            <Icon name="lock" size={16} className="mt-0.5 shrink-0 text-text-3" />
            <div>
              <p className="text-sm font-semibold">Public cards are off</p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-text-2">
                Anchor will not publish a card for an account that has not asked
                it to. Turn public cards on and this becomes a live preview of
                what other people would see. You can turn it back off at any
                time.
              </p>
            </div>
          </div>
          <Link href="/profile#sharing" className="self-start">
            <Button variant="secondary" size="sm">
              Open sharing settings
            </Button>
          </Link>
        </div>
      ) : !everFinished ? (
        <div className="well p-4">
          <p className="text-sm font-semibold">Nothing to show yet</p>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-text-2">
            The card counts items you finished. Play a set and it fills in —
            Anchor will not put a number on a card it has not measured.
          </p>
          <Link href="/today" className="mt-3 inline-block">
            <Button size="sm">Go to today&apos;s five</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <Preview
            name={displayName}
            range={range}
            stats={current}
            includeStreak={includeStreak}
          />

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              role="group"
              aria-label="Window"
              className="inline-flex gap-1 rounded-[var(--r-md)] border border-[var(--line)] bg-surface p-1 shadow-[var(--shadow-xs)]"
            >
              {SHARE_RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={range === r}
                  onClick={() => setRange(r)}
                  className={`inline-flex min-h-9 cursor-pointer items-center rounded-[var(--r-sm)] px-3 text-[0.8125rem] font-semibold transition-all duration-[130ms] ${
                    range === r
                      ? "bg-text text-canvas shadow-[var(--shadow-xs)]"
                      : "text-text-2 hover:bg-raised hover:text-text"
                  }`}
                >
                  {RANGE_TAB[r]}
                </button>
              ))}
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={includeStreak}
              onClick={() => setIncludeStreak((v) => !v)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--r-md)] px-1.5 text-[0.8125rem] font-semibold text-text-2 transition-colors hover:text-text"
            >
              <span
                aria-hidden
                className={`flex h-6 w-10 items-center rounded-full border px-0.5 transition-colors ${
                  includeStreak
                    ? "justify-end border-brand/40 bg-brand"
                    : "justify-start border-[var(--line-strong)] bg-sunken"
                }`}
              >
                <span
                  className={`size-4.5 rounded-full transition-colors ${
                    includeStreak ? "bg-[var(--brand-ink)]" : "bg-text-3"
                  }`}
                />
              </span>
              Include recall days
            </button>
          </div>

          {current.finished === 0 && (
            <p className="text-xs leading-relaxed text-text-3">
              Nothing was finished in this window, so the card is honest but
              bare. All time has more to show.
            </p>
          )}

          <ShareButton
            title="Anchor"
            text={shareCaption(current, range, includeStreak)}
            url={`${siteUrl}/auth?mode=signup`}
            imageUrl={imageUrl}
            friendCode={friendCode}
          />

          <WhyThis k="sharing" />
        </div>
      )}
    </Card>
  );
}
