"use client";

// Calendar heatmap of the last 90 days: 7 day rows x whole-week columns,
// intensity on a single brand ramp built from tokens so both themes work.
//
// Three things this used to get wrong:
//   • it drew 91 cells under a heading that said 90;
//   • it built the grid from local dates run through toISOString() (UTC) while
//     the counts were bucketed on the UTC prefix of created_at, and then called
//     getDay() locally on a UTC-parsed string — so at negative UTC offsets every
//     cell was a day out and the Monday alignment was wrong too. Everything
//     here is now UTC end to end, matching how the counts are bucketed;
//   • the only way to read a day was a title= attribute, which does nothing on
//     touch. Each cell is now a real button and the selected day is announced
//     in a live region above the grid.

import { useMemo, useState } from "react";

const DAY_MS = 86_400_000;

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

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Day {
  /** YYYY-MM-DD, UTC — the same key the counts are bucketed on. */
  date: string;
  count: number;
}

/** Midnight-UTC epoch of a YYYY-MM-DD string. */
const utcMs = (day: string) => Date.parse(`${day}T00:00:00.000Z`);

const isoUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** "14 Aug 2026", from UTC parts so server and client render the same string. */
function longDate(day: string): string {
  const d = new Date(utcMs(day));
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const BANDS = [
  { label: "none", from: 0 },
  { label: "1–2", from: 1 },
  { label: "3–5", from: 3 },
  { label: "6+", from: 6 },
] as const;

function tint(count: number): string {
  if (count <= 0) return "var(--sunken)";
  if (count <= 2) return "color-mix(in oklab, var(--brand) 28%, var(--sunken))";
  if (count <= 5) return "color-mix(in oklab, var(--brand) 62%, var(--sunken))";
  return "var(--brand)";
}

export function CalendarHeatmap({
  counts,
  days = 90,
  today,
}: {
  counts: Record<string, number>; // YYYY-MM-DD (UTC) -> puzzles completed
  /** How many days the grid covers, inclusive of today. */
  days?: number;
  /** Last day of the grid, YYYY-MM-DD UTC. Pass it from the server so the
   *  markup does not shift between render and hydration. */
  today?: string;
}) {
  const [selected, setSelected] = useState<Day | null>(null);

  const { weeks, total, activeDays, span } = useMemo(() => {
    const end = today ? utcMs(today) : utcMs(isoUtc(Date.now()));
    const span = Math.max(1, Math.floor(days));

    // `days` cells, ending today. i = span - 1 is the oldest.
    const grid: Day[] = [];
    for (let i = span - 1; i >= 0; i--) {
      const date = isoUtc(end - i * DAY_MS);
      grid.push({ date, count: counts[date] ?? 0 });
    }

    // Pad the first column so every column is a whole Monday-to-Sunday week.
    const firstDow = (new Date(utcMs(grid[0].date)).getUTCDay() + 6) % 7;
    const cells: (Day | null)[] = [
      ...Array.from({ length: firstDow }, () => null),
      ...grid,
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (Day | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return {
      weeks,
      total: grid.reduce((n, d) => n + d.count, 0),
      activeDays: grid.filter((d) => d.count > 0).length,
      span,
    };
  }, [counts, days, today]);

  // One label per column that starts a new month, so the strip is readable.
  const monthLabel = (week: (Day | null)[], w: number): string | null => {
    const first = week.find((c): c is Day => c !== null);
    if (!first) return null;
    const month = new Date(utcMs(first.date)).getUTCMonth();
    if (w === 0) return MONTHS[month];
    const prev = weeks[w - 1].find((c): c is Day => c !== null);
    if (!prev) return null;
    return new Date(utcMs(prev.date)).getUTCMonth() === month
      ? null
      : MONTHS[month];
  };

  return (
    <div>
      {/* Fixed-height readout so selecting a day never shifts the grid. */}
      <p aria-live="polite" className="min-h-6 text-sm text-text-2">
        {selected ? (
          <>
            <span className="num font-semibold text-text">
              {longDate(selected.date)}
            </span>
            {" — "}
            <span className="num">{selected.count}</span>{" "}
            {selected.count === 1 ? "puzzle" : "puzzles"}
          </>
        ) : (
          <span className="text-text-3">
            Pick a day to read its count.{" "}
            <span className="num">{activeDays}</span> of{" "}
            <span className="num">{span}</span> days active,{" "}
            <span className="num">{total}</span>{" "}
            {total === 1 ? "puzzle" : "puzzles"} in all.
          </span>
        )}
      </p>

      <div className="no-scrollbar mt-2.5 overflow-x-auto pb-1">
        <div className="flex w-max gap-2">
          {/* Weekday gutter: three labels is enough to orient the rows. */}
          <div
            aria-hidden
            className="mt-[1.125rem] flex flex-col gap-1 pr-0.5 text-[0.625rem] leading-[0.875rem] text-text-3"
          >
            {WEEKDAYS.map((d, i) => (
              <span key={d} className="h-3.5">
                {i % 2 === 0 ? d.slice(0, 1) : ""}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            {weeks.map((week, w) => (
              <div key={w} className="flex flex-col gap-1">
                <span
                  aria-hidden
                  className="h-4 text-[0.625rem] leading-4 text-text-3"
                >
                  {monthLabel(week, w)}
                </span>
                {week.map((cell, d) =>
                  cell === null ? (
                    <span key={d} className="size-3.5" />
                  ) : (
                    <button
                      key={d}
                      type="button"
                      onClick={() =>
                        setSelected((s) =>
                          s?.date === cell.date ? null : cell,
                        )
                      }
                      aria-pressed={selected?.date === cell.date}
                      className={`size-3.5 rounded-[3px] transition-transform hover:scale-125 ${
                        selected?.date === cell.date
                          ? "ring-2 ring-text ring-offset-1 ring-offset-[var(--surface)]"
                          : ""
                      }`}
                      style={{
                        background: tint(cell.count),
                        boxShadow:
                          cell.count === 0
                            ? "inset 0 0 0 1px var(--line-strong)"
                            : undefined,
                      }}
                    >
                      <span className="sr-only">
                        {longDate(cell.date)}: {cell.count}{" "}
                        {cell.count === 1 ? "puzzle" : "puzzles"}
                      </span>
                    </button>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Labelled legend — the old one was the words "none" and "a lot" with
          four unexplained swatches between them. */}
      <ul
        aria-label="Puzzles finished per day"
        className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text-3"
      >
        <li className="font-semibold">Puzzles per day</li>
        {BANDS.map((b) => (
          <li key={b.label} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-3 rounded-[3px]"
              style={{
                background: tint(b.from),
                boxShadow:
                  b.from === 0 ? "inset 0 0 0 1px var(--line-strong)" : undefined,
              }}
            />
            <span className="num">{b.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
