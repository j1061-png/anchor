"use client";

// Dashboard charts. Recharts, coloured only from the token palette — the
// values are CSS variables written straight into SVG presentation attributes,
// so both themes work and no hex is hard-coded anywhere.
//
// Two layout bugs fixed here:
//   • CategoryBars truncated six labels to 7 characters at 9px with
//     interval={0} inside a half-width card, which collided on a 390px screen.
//     It is now a horizontal bar chart with a real label gutter, so the full
//     category name is readable at any width.
//   • CategoryRadar clipped its six outer labels at outerRadius="70%" in a
//     264px box. The plot is smaller, the box is taller, and two-word labels
//     wrap onto two lines instead of running off the edge.
//
// ScoreSparkline and ScoreOverTime used to live here. They rendered a composite
// score that R1 retired, nothing imported them, and they have been deleted.

import {
  Bar,
  BarChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

const AXIS = "var(--text-3)";
const GRID = "var(--line-strong)";

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--r-sm)] border border-[var(--line)] bg-surface px-2.5 py-1.5 text-xs shadow-[var(--shadow-md)]">
      {label !== undefined && <p className="text-text-2">{label}</p>}
      <p className="num font-semibold">
        {payload[0].value}
        {unit ?? ""}
      </p>
    </div>
  );
}

/**
 * Radar tick that wraps a two-word category onto two lines. Six labels around a
 * 264px plot ran off the edge as one line each.
 */
function WrappedAngleTick(props: {
  x?: number;
  y?: number;
  textAnchor?: "start" | "middle" | "end" | "inherit";
  payload?: { value?: string };
}) {
  const { x = 0, y = 0, textAnchor = "middle", payload } = props;
  const words = String(payload?.value ?? "").split(" ");
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill={AXIS}
      fontSize={11}
      dominantBaseline="central"
    >
      {words.map((word, i) => (
        <tspan key={i} x={x} dy={i === 0 ? (words.length > 1 ? -5 : 0) : 12}>
          {word}
        </tspan>
      ))}
    </text>
  );
}

export function CategoryRadar({
  ratings,
}: {
  ratings: { category: Category; rating: number }[];
}) {
  const data = ratings.map((r) => ({
    label: CATEGORY_LABELS[r.category],
    rating: r.rating,
  }));

  if (data.length === 0) {
    return (
      <p className="text-sm text-text-2">
        Ratings appear here once you have played a puzzle in a category.
      </p>
    );
  }

  // Math.min/max spread over an empty array yields Infinity/-Infinity, which
  // used to be read out to screen readers as "range Infinity to -Infinity".
  const values = ratings.map((r) => r.rating);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div>
      <div
        className="h-72 w-full sm:h-80"
        role="img"
        aria-label="rating by category"
      >
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="62%" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <PolarGrid stroke={GRID} />
            <PolarAngleAxis dataKey="label" tick={<WrappedAngleTick />} />
            <Radar
              dataKey="rating"
              stroke="var(--brand)"
              strokeWidth={2}
              fill="var(--brand)"
              fillOpacity={0.15}
              isAnimationActive={false}
            />
            <Tooltip content={<ChartTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        {data.map((d) => `${d.label} ${d.rating}`).join(", ")}; range {min} to{" "}
        {max}
      </p>
    </div>
  );
}

const TONES: Record<string, string> = {
  green: "var(--green)",
  amber: "var(--amber)",
  cobalt: "var(--cobalt)",
};

/**
 * Per-category percentage bars, one hue — the same measure across categories,
 * so identity never rides on colour. Horizontal, because six category names do
 * not fit under a chart half a phone wide.
 */
export function CategoryBars({
  rows,
  tone = "cobalt",
}: {
  rows: { category: Category; value: number }[];
  tone?: "green" | "amber" | "cobalt";
}) {
  const data = rows.map((r) => ({
    label: CATEGORY_LABELS[r.category],
    value: Math.round(r.value),
  }));

  if (data.length === 0) return null;

  return (
    <div style={{ height: Math.max(96, data.length * 30 + 24) }} className="w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tick={{ fill: AXIS, fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={104}
            tick={{ fill: AXIS, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <Tooltip
            content={<ChartTooltip unit="%" />}
            cursor={{ fill: "var(--text-3)", fillOpacity: 0.08 }}
          />
          <Bar
            dataKey="value"
            fill={TONES[tone]}
            radius={[0, 4, 4, 0]}
            maxBarSize={14}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
