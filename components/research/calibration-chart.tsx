"use client";

// Feature H3 — the calibration curve. Confidence stated before answering (H1)
// against the accuracy actually achieved in that band (H2).
//
// Read it against the dashed diagonal: a point below the line means the rating
// ran ahead of the result in that band, a point above means the working held up
// better than the rating did. Points, not verdicts — the sentence underneath the
// chart on the page comes from calibrationVerdict, and it names bands, never the
// student (H6).
//
// Colours come from the token variables, written straight into the SVG
// presentation attributes Recharts emits: cobalt for the data, the hairline
// token for the grid, brand for the reference line. Nothing hard-coded, so both
// themes work.
//
// The chart is decoration for screen readers; the table below it is the data,
// so both stay in sync and the numbers are reachable without sight of the plot.

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CalibrationBin } from "@/lib/research/calibration";
import { MIN_BIN_SAMPLE } from "@/lib/research/calibration";

const INK = "var(--cobalt)";
const SLATE = "var(--text-3)";
const GRID = "var(--line-strong)";
const FLAG = "var(--brand)";

const TICKS = [0, 25, 50, 75, 100];

function BinTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: CalibrationBin }[];
}) {
  const bin = payload?.[0]?.payload;
  if (!active || !bin) return null;
  return (
    <div className="rounded-[var(--r-sm)] border border-[var(--line)] bg-surface px-2.5 py-1.5 text-xs shadow-[var(--shadow-md)]">
      <p className="text-text-2">{bin.rangeLabel} band</p>
      <p className="num font-semibold">
        said {bin.meanConfidence}% · right {bin.actualAccuracy}%
      </p>
      <p className="num text-text-3">
        {bin.n} {bin.n === 1 ? "item" : "items"}
      </p>
    </div>
  );
}

export interface CalibrationChartProps {
  bins: CalibrationBin[];
}

export function CalibrationChart({ bins }: CalibrationChartProps) {
  if (bins.length === 0) {
    return (
      <p className="text-sm text-text-2">
        No confidence ratings recorded yet, so there is no curve to draw. Rate
        how sure you are before you answer and the bands fill in.
      </p>
    );
  }

  return (
    <div>
      <div className="h-56 w-full sm:h-64" aria-hidden>
        <ResponsiveContainer>
          <LineChart
            data={bins}
            margin={{ top: 8, right: 12, bottom: 4, left: -20 }}
          >
            <CartesianGrid stroke={GRID} />
            <XAxis
              type="number"
              dataKey="meanConfidence"
              domain={[0, 100]}
              ticks={TICKS}
              tick={{ fill: SLATE, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              type="number"
              domain={[0, 100]}
              ticks={TICKS}
              tick={{ fill: SLATE, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={46}
              tickFormatter={(v: number) => `${v}%`}
            />
            <ReferenceLine
              segment={[
                { x: 0, y: 0 },
                { x: 100, y: 100 },
              ]}
              stroke={FLAG}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              ifOverflow="hidden"
            />
            <Tooltip content={<BinTooltip />} />
            <Line
              type="linear"
              dataKey="actualAccuracy"
              stroke={INK}
              strokeWidth={2}
              dot={{ r: 4, fill: INK, stroke: INK }}
              activeDot={{ r: 5, fill: FLAG, stroke: "none" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-1 text-xs text-text-3">
        Across the bottom: the confidence you stated. Up the side: how often you
        were right. The dashed line is where the two match exactly.
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Confidence bands, what you predicted, and what you scored
          </caption>
          <thead>
            <tr className="border-b border-[var(--line-strong)] text-xs text-text-3">
              <th scope="col" className="py-1.5 pr-2 font-semibold">
                Band
              </th>
              <th scope="col" className="py-1.5 pr-2 font-semibold">
                You said
              </th>
              <th scope="col" className="py-1.5 pr-2 font-semibold">
                You were right
              </th>
              <th scope="col" className="py-1.5 font-semibold">
                Items
              </th>
            </tr>
          </thead>
          <tbody>
            {bins.map((bin) => (
              <tr key={bin.bin} className="border-b border-[var(--line)] last:border-0">
                <th scope="row" className="num py-1.5 pr-2 font-normal">
                  {bin.rangeLabel}
                </th>
                <td className="num py-1.5 pr-2">{bin.meanConfidence}%</td>
                <td className="num py-1.5 pr-2">{bin.actualAccuracy}%</td>
                <td className="num py-1.5">
                  {bin.n}
                  {bin.n < MIN_BIN_SAMPLE ? (
                    <span className="ml-1.5 font-body text-xs text-text-3">
                      too few to read
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
