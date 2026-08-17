import { Fragment, type CSSProperties } from "react";
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_BLURBS,
  ACHIEVEMENT_CATEGORY_LABELS,
  type AchievementDef,
  type AchievementProgress,
} from "@/lib/achievement-meta";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { ShareInline } from "@/components/share/share-inline";

// Achievement grid (§6). Grouped by the six categories that used to exist only
// as comments in lib/achievements.ts, so 21 tiles read as six short lists
// rather than one wall. Every tile carries an Icon, an earned tile carries the
// date it landed, and a locked tile carries its hint plus — where the number is
// cheap to compute — how far along it is. Nothing renders as "———".
//
// Presentational and client-safe: everything it needs comes from
// lib/achievement-meta, which carries no `server-only` marker, so this never
// drags the evaluation code in lib/achievements into a client bundle.
//
// An earned item carries its own share affordance. That is what makes the
// `achievement` card in app/api/share/[type]/[id] reachable from the UI at all.

export interface UnlockedAchievement {
  /** achievements.achievement_key */
  key: string;
  /** achievements.id — the row the share-card route renders from. */
  id: string;
  /** achievements.unlocked_at, ISO. Null when the column came back empty. */
  at?: string | null;
}

interface AchievementGridProps {
  defs: AchievementDef[];
  unlocked: UnlockedAchievement[];
  /**
   * Current value of each progress metric. Anything missing simply means a
   * locked tile shows its hint with no bar — never an invented number.
   */
  progress?: AchievementProgress;
  /** Omit to render the grid with no share affordances at all. */
  share?: {
    /** profiles.leaderboard_opt_in. Off means the card would 404 publicly. */
    optedIn: boolean;
    friendCode?: string;
    siteUrl: string;
  };
}

// Design rule: every numeral gets the data face, including numbers inside
// achievement copy ("solve 50 puzzles").
function WithNums({ text }: { text: string }) {
  const parts = text.split(/(\d+)/);
  return (
    <>
      {parts.map((part, i) =>
        /^\d+$/.test(part) ? (
          <span key={i} className="num">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "14 Aug 2026". Built from UTC parts so the server and the client agree. */
function formatEarned(iso: string): string | null {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  const d = new Date(ms);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function AchievementGrid({
  defs,
  unlocked,
  progress,
  share,
}: AchievementGridProps) {
  const earned = new Map(unlocked.map((u) => [u.key, u]));

  if (defs.length === 0) {
    return (
      <p className="text-sm text-text-2">
        Achievements land here after your first session.
      </p>
    );
  }

  const groups = ACHIEVEMENT_CATEGORIES.map((category) => ({
    category,
    items: defs.filter((d) => d.category === category),
  })).filter((g) => g.items.length > 0);

  // Anything with a category the registry does not know about still gets shown
  // rather than silently dropped.
  const known = new Set(groups.flatMap((g) => g.items.map((d) => d.key)));
  const orphans = defs.filter((d) => !known.has(d.key));

  return (
    <div className="flex flex-col gap-9">
      {groups.map(({ category, items }) => (
        <Group
          key={category}
          heading={ACHIEVEMENT_CATEGORY_LABELS[category]}
          blurb={ACHIEVEMENT_CATEGORY_BLURBS[category]}
          items={items}
          earned={earned}
          progress={progress}
          share={share}
        />
      ))}
      {orphans.length > 0 && (
        <Group
          heading="Everything else"
          items={orphans}
          earned={earned}
          progress={progress}
          share={share}
        />
      )}
    </div>
  );
}

function Group({
  heading,
  blurb,
  items,
  earned,
  progress,
  share,
}: {
  heading: string;
  blurb?: string;
  items: AchievementDef[];
  earned: Map<string, UnlockedAchievement>;
  progress?: AchievementProgress;
  share?: AchievementGridProps["share"];
}) {
  const got = items.filter((d) => earned.has(d.key)).length;

  return (
    <section aria-label={`${heading} achievements`}>
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h3 className="t-eyebrow">{heading}</h3>
          {blurb && (
            <p className="mt-1 text-sm leading-relaxed text-text-2">{blurb}</p>
          )}
        </div>
        <p className="num shrink-0 text-xs text-text-3">
          {got} of {items.length}
        </p>
      </div>

      <ul className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((d, i) => {
          const row = earned.get(d.key);
          return (
            <li key={d.key} style={{ "--i": i } as CSSProperties}>
              {row ? (
                <EarnedTile def={d} row={row} share={share} />
              ) : (
                <LockedTile def={d} progress={progress} />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function EarnedTile({
  def: d,
  row,
  share,
}: {
  def: AchievementDef;
  row: UnlockedAchievement;
  share?: AchievementGridProps["share"];
}) {
  const on = row.at ? formatEarned(row.at) : null;

  return (
    <article
      className="card flex h-full flex-col p-4"
      aria-label={`${d.name}: earned${on ? ` on ${on}` : ""}. ${d.description}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-[var(--r-md)] text-[var(--gold)]"
          style={{
            background: "color-mix(in oklab, var(--gold) 18%, transparent)",
          }}
        >
          <Icon name={d.icon} size={19} />
        </span>
        <Badge tone="gold" icon="check">
          Earned
        </Badge>
      </div>

      <h4 className="mt-3.5 font-display text-base font-bold leading-tight">
        {d.name}
      </h4>
      <p className="mt-1.5 text-sm leading-relaxed text-text-2">
        <WithNums text={d.description} />
      </p>
      {on && (
        <p className="num mt-2 text-xs text-text-3">
          <span className="font-body font-semibold">Earned </span>
          {on}
        </p>
      )}

      {share && (
        <ShareInline
          className="-ml-2 mt-auto pt-2"
          label={`Share the milestone ${d.name}`}
          title="Anchor"
          text={`${d.name} — ${d.description}`}
          url={`${share.siteUrl}/auth?mode=signup`}
          imageUrl={`/api/share/achievement/${row.id}`}
          friendCode={share.friendCode}
          optedIn={share.optedIn}
        />
      )}
    </article>
  );
}

function LockedTile({
  def: d,
  progress,
}: {
  def: AchievementDef;
  progress?: AchievementProgress;
}) {
  const spec = d.progress;
  const now = spec ? progress?.[spec.metric] : undefined;
  const showBar =
    spec !== undefined && typeof now === "number" && Number.isFinite(now);

  // "7 of 10 solved" — the same sentence the screen reader gets.
  const line = showBar
    ? `${Math.min(now, spec.target)} of ${spec.target} ${spec.noun}`
    : null;

  return (
    <article
      className="flex h-full flex-col rounded-[var(--r-lg)] border border-dashed border-[var(--line-strong)] bg-raised/60 p-4"
      aria-label={`${d.name}: not earned yet. To earn it, ${d.hint}${line ? `. Currently ${line}` : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-[var(--r-md)] bg-sunken text-text-3"
        >
          <Icon name={d.icon} size={19} />
        </span>
        <span
          aria-hidden
          className="mt-1 text-text-3 opacity-70"
          title="Not earned yet"
        >
          <Icon name="lock" size={15} />
        </span>
      </div>

      <h4 className="mt-3.5 font-display text-base font-bold leading-tight text-text-2">
        {d.name}
      </h4>
      <p className="mt-1.5 text-sm leading-relaxed text-text-3">
        <span className="font-semibold">To earn it: </span>
        <WithNums text={d.hint} />
      </p>

      {showBar ? (
        <div className="mt-auto pt-3.5">
          <ProgressBar
            value={spec.target > 0 ? now / spec.target : 0}
            color="var(--text-3)"
            label={line ?? undefined}
          />
          <p aria-hidden className="num mt-1.5 text-xs text-text-3">
            {line}
          </p>
        </div>
      ) : (
        <p aria-hidden className="mt-auto pt-3.5 text-xs text-text-3">
          No part-progress to show — this one happens in a single go.
        </p>
      )}
    </article>
  );
}
