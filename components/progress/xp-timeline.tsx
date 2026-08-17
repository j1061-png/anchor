"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Milestone,
  TimelineDay,
  TimelineResponse,
} from "@/lib/progress-data";
import { reasonMeta } from "@/lib/xp-events";
import { Icon } from "@/components/ui/icon";

const RANGES = [
  { key: "7", label: "Week", days: 7 },
  { key: "30", label: "Month", days: 30 },
  { key: "90", label: "3 months", days: 90 },
  { key: "all", label: "All time", days: Infinity },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

const fmtDay = (day: string) =>
  new Date(day + "T00:00:00Z").toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

const milestoneTone = (kind: Milestone["kind"]) =>
  kind === "achievement"
    ? "var(--gold)"
    : kind === "level"
      ? "var(--brand)"
      : "var(--text-3)";

/**
 * Cumulative XP over time with the milestones that happened along the way.
 *
 * Replaces the bare "340 XP" number: the point is not the total, it is the
 * shape of the climb and what you did to earn each step of it.
 */
export function XpTimeline({ data }: { data: TimelineResponse }) {
  const [range, setRange] = useState<RangeKey>("30");
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = width < 560 ? 190 : 260;
  const padT = 16;
  const padB = 26;
  const padL = 0;
  const padR = 0;

  const days: TimelineDay[] = useMemo(() => {
    const all = data.days;
    const n = RANGES.find((r) => r.key === range)!.days;
    if (!Number.isFinite(n) || all.length <= n) return all;
    return all.slice(-n);
  }, [data.days, range]);

  const { path, areaPath, points, minXp, maxXp } = useMemo(() => {
    if (days.length === 0) {
      return {
        path: "",
        areaPath: "",
        points: [] as { x: number; y: number; d: TimelineDay }[],
        minXp: 0,
        maxXp: 0,
      };
    }
    const lo = days[0].cumulative;
    const hi = days[days.length - 1].cumulative;
    // Always give the curve some vertical room, even on a flat week.
    const span = Math.max(hi - lo, 10);
    const top = hi + span * 0.12;
    const bottom = Math.max(0, lo - span * 0.04);
    const innerW = Math.max(1, width - padL - padR);
    const innerH = Math.max(1, height - padT - padB);

    const pts = days.map((d, i) => {
      const x =
        padL + (days.length === 1 ? innerW / 2 : (i / (days.length - 1)) * innerW);
      const y =
        padT +
        innerH -
        ((d.cumulative - bottom) / Math.max(1, top - bottom)) * innerH;
      return { x, y, d };
    });

    // Smooth the line with a light cardinal spline so it reads as a climb,
    // not a sawtooth, without hiding the real steps.
    let line = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const t = 0.18;
      const c1x = p1.x + (p2.x - p0.x) * t;
      const c1y = p1.y + (p2.y - p0.y) * t;
      const c2x = p2.x - (p3.x - p1.x) * t;
      const c2y = p2.y - (p3.y - p1.y) * t;
      line += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    const base = padT + innerH;
    const area = `${line} L ${pts[pts.length - 1].x} ${base} L ${pts[0].x} ${base} Z`;

    return { path: line, areaPath: area, points: pts, minXp: bottom, maxXp: top };
  }, [days, width, height]);

  // Milestones that fall inside the visible window, snapped to a day index.
  const visibleMilestones = useMemo(() => {
    if (days.length === 0) return [];
    const first = days[0].day;
    const last = days[days.length - 1].day;
    const index = new Map(days.map((d, i) => [d.day, i]));
    return data.milestones
      .filter((m) => {
        const day = m.at.slice(0, 10);
        return day >= first && day <= last;
      })
      .map((m) => {
        const i = index.get(m.at.slice(0, 10)) ?? 0;
        return { m, point: points[i] };
      })
      .filter((x) => Boolean(x.point));
  }, [data.milestones, days, points]);

  const onMove = useCallback(
    (clientX: number) => {
      const el = wrapRef.current;
      if (!el || points.length === 0) return;
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < points.length; i++) {
        const d = Math.abs(points[i].x - x);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      setHover(best);
    },
    [points],
  );

  const active = hover !== null ? points[hover] : null;
  const activeDay = active?.d;
  const activeMilestones =
    activeDay !== undefined
      ? data.milestones.filter((m) => m.at.slice(0, 10) === activeDay.day)
      : [];

  const empty = days.length === 0;

  return (
    <div className="card overflow-hidden p-0">
      {/* --- Header: range control ------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4 sm:px-6">
        <div>
          <p className="t-eyebrow">Total earned</p>
          <p className="num mt-1 text-2xl leading-none">
            {data.totalXp.toLocaleString()}
            <span className="ml-1.5 text-sm font-normal text-text-3">XP</span>
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Time range"
          className="flex gap-0.5 rounded-[var(--r-md)] border border-[var(--line)] bg-raised p-1"
        >
          {RANGES.map((r) => (
            <button
              key={r.key}
              role="tab"
              aria-selected={range === r.key}
              onClick={() => {
                setRange(r.key);
                setHover(null);
              }}
              className={`cursor-pointer rounded-[var(--r-xs)] px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                range === r.key
                  ? "bg-surface text-text shadow-[var(--shadow-xs)]"
                  : "text-text-3 hover:text-text-2"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Chart ------------------------------------------------------- */}
      <div
        ref={wrapRef}
        className="relative touch-pan-y select-none px-1"
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(e) => onMove(e.clientX)}
      >
        {empty ? (
          <div
            className="grid place-items-center px-6 text-center"
            style={{ height }}
          >
            <div>
              <p className="text-sm font-semibold">No XP yet</p>
              <p className="mt-1 max-w-xs text-sm text-text-2">
                Finish a session and your climb starts here. Solving something
                unaided is worth the most.
              </p>
            </div>
          </div>
        ) : (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`Cumulative XP over the selected range, ending at ${data.totalXp} XP`}
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--brand)"
                  stopOpacity="0.26"
                />
                <stop
                  offset="100%"
                  stopColor="var(--brand)"
                  stopOpacity="0.01"
                />
              </linearGradient>
            </defs>

            {/* Horizontal guides */}
            {[0, 0.5, 1].map((f) => {
              const y = padT + (height - padT - padB) * f;
              return (
                <line
                  key={f}
                  x1={0}
                  x2={width}
                  y1={y}
                  y2={y}
                  stroke="var(--line)"
                  strokeDasharray="3 5"
                />
              );
            })}

            <path d={areaPath} fill="url(#xpFill)" />
            <path
              d={path}
              fill="none"
              stroke="var(--brand)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Milestone markers sit on the curve */}
            {visibleMilestones.map(({ m, point }) => (
              <g key={m.key + m.at}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={6.5}
                  fill="var(--surface)"
                  stroke={milestoneTone(m.kind)}
                  strokeWidth={2.5}
                />
              </g>
            ))}

            {/* Scrubber */}
            {active && (
              <g>
                <line
                  x1={active.x}
                  x2={active.x}
                  y1={padT - 6}
                  y2={height - padB}
                  stroke="var(--text-3)"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />
                <circle
                  cx={active.x}
                  cy={active.y}
                  r={5}
                  fill="var(--brand)"
                  stroke="var(--surface)"
                  strokeWidth={2.5}
                />
              </g>
            )}

            {/* End cap */}
            {!active && points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r={5}
                fill="var(--brand)"
                stroke="var(--surface)"
                strokeWidth={2.5}
              />
            )}

            {/* Date ends */}
            <text
              x={2}
              y={height - 8}
              fontSize={11}
              fill="var(--text-3)"
              className="num"
            >
              {fmtDay(days[0].day)}
            </text>
            <text
              x={width - 2}
              y={height - 8}
              fontSize={11}
              textAnchor="end"
              fill="var(--text-3)"
              className="num"
            >
              {fmtDay(days[days.length - 1].day)}
            </text>
          </svg>
        )}

        {/* Tooltip */}
        {active && activeDay && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-max max-w-[15rem] rounded-[var(--r-md)] border border-[var(--line)] bg-surface p-3 shadow-[var(--shadow-lg)]"
            style={{
              left: Math.min(Math.max(active.x - 90, 4), Math.max(4, width - 190)),
            }}
          >
            <p className="num text-xs text-text-3">{fmtDay(activeDay.day)}</p>
            <p className="num mt-0.5 text-lg leading-none">
              {activeDay.cumulative.toLocaleString()}
              <span className="ml-1 text-xs font-normal text-text-3">XP</span>
            </p>
            {activeDay.xp > 0 ? (
              <p className="mt-1 text-xs font-semibold text-[var(--green)]">
                +{activeDay.xp} that day
              </p>
            ) : (
              <p className="mt-1 text-xs text-text-3">Nothing earned</p>
            )}
            {activeMilestones.map((m) => (
              <p
                key={m.key}
                className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: milestoneTone(m.kind) }}
              >
                <Icon
                  name={m.kind === "achievement" ? "trophy" : "spark"}
                  size={12}
                />
                {m.label}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* --- Legend ------------------------------------------------------ */}
      {!empty && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--line)] px-5 py-3 text-xs text-text-3 sm:px-6">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-brand" /> Level up
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--gold)]" /> Achievement
          </span>
          <span className="ml-auto hidden sm:inline">
            Drag across the chart to read any day
          </span>
        </div>
      )}
    </div>
  );
}

/** Grouped, human-readable list of what earned XP recently. */
export function XpBreakdownList({ data }: { data: TimelineResponse }) {
  const groups = useMemo(() => {
    const byReason = new Map<string, { count: number; total: number }>();
    for (const e of data.events) {
      const cur = byReason.get(e.reason) ?? { count: 0, total: 0 };
      cur.count += 1;
      cur.total += e.amount;
      byReason.set(e.reason, cur);
    }
    return [...byReason.entries()]
      .map(([reason, v]) => ({ reason, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [data.events]);

  if (groups.length === 0) return null;

  const grand = groups.reduce((s, g) => s + g.total, 0);

  return (
    <ul className="stagger space-y-2.5">
      {groups.map((g, i) => {
        const meta = reasonMeta(g.reason);
        const share = grand > 0 ? g.total / grand : 0;
        return (
          <li
            key={g.reason}
            style={{ ["--i" as string]: i }}
            className="card flex items-start gap-3.5 p-4"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-raised text-text-2">
              <Icon name={meta.icon} size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">{meta.label}</p>
                <p className="num shrink-0 text-sm font-semibold">
                  {g.total.toLocaleString()}
                </p>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-text-2">
                {meta.note}
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-sunken">
                <div
                  className="h-full rounded-full bg-brand/60"
                  style={{ width: `${Math.round(share * 100)}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
