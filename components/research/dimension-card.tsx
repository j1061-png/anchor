import type { CSSProperties, ReactNode } from "react";
import type { Dimension } from "@/lib/research/types";
import { MIN_SAMPLE } from "@/lib/research/independence";
import { Icon } from "@/components/ui/icon";
import { ProxyNote } from "./proxy-note";

// Feature F — one dimension of the independence profile, shown on its own (F1,
// F5). Six of these sit side by side and are never combined: they count
// different behaviours over different denominators, so an average of them would
// be a number no evidence supports (R1).
//
// Every card states three things the figure cannot be read without:
//   • the Wilson 95% interval, in points (F3)
//   • the sample the figure came from (F3)
//   • what was actually counted, in plain words (F4, G1)
//
// Below the sample floor the card says so instead of printing a number, because
// a rate from three attempts is noise with a decimal point on it (F3).
//
// Nothing here colours a figure as good or bad. High hint reliance gets the same
// ink as low hint reliance, and the card carries a next action rather than a
// warning (G3 — never shame). The next action is the one thing that folds away,
// so six cards read as six figures rather than six paragraphs.

const SAMPLE_NOUN: Record<Dimension["key"], [string, string]> = {
  unaided_accuracy: ["unaided attempt", "unaided attempts"],
  hint_reliance: ["attempt", "attempts"],
  persistence: ["attempt", "attempts"],
  delayed_retention: ["review", "reviews"],
  transfer: ["transfer item", "transfer items"],
  calibration: ["rated attempt", "rated attempts"],
};

function noun(key: Dimension["key"], n: number): string {
  const [one, many] = SAMPLE_NOUN[key];
  return n === 1 ? one : many;
}

function Num({ children }: { children: ReactNode }) {
  return <span className="num">{children}</span>;
}

/** Half-width, rounded out rather than in — the wider reading is the safe one. */
function ciPoints(ci: number): number {
  return Math.max(1, Math.round(ci));
}

export interface DimensionCardProps {
  dimension: Dimension;
  /** What the trend compares against, e.g. "the previous 7 days". */
  comparisonLabel: string;
  /**
   * One neutral, factual thing to do next (G3). Stated as an option, never as a
   * correction. Optional — a dimension with nothing useful to suggest says
   * nothing.
   */
  nextAction?: string;
  /** Position in the grid, for the entrance stagger. */
  index?: number;
}

export function DimensionCard({
  dimension,
  comparisonLabel,
  nextAction,
  index = 0,
}: DimensionCardProps) {
  const { key, label, value, ci, sample, lowerIsBetter, definition, trend } =
    dimension;
  const enough = value !== null && ci !== null;

  return (
    <section
      className="card flex h-full flex-col p-5"
      style={{ "--i": index } as CSSProperties}
      aria-label={`${label}, ${enough ? `${Math.round(value)} percent from ${sample} ${noun(key, sample)}` : "not enough data yet"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="t-section">{label}</h3>
        <span className="t-eyebrow shrink-0 whitespace-nowrap pt-1">
          {lowerIsBetter ? "lower is better" : "higher is better"}
        </span>
      </div>

      {enough ? (
        <div className="mt-3">
          <p className="flex items-baseline gap-2">
            <span className="num text-[2.5rem] leading-none">
              {Math.round(value)}%
            </span>
            <span className="num text-base text-text-3">± {ciPoints(ci)}</span>
          </p>
          <p className="mt-2 text-sm text-text-3">
            from <Num>{sample}</Num> {noun(key, sample)}, <Num>95%</Num> Wilson
            interval
          </p>
        </div>
      ) : (
        <div className="mt-3">
          <p className="font-display text-base font-bold leading-snug">
            Not enough data yet — needs <Num>{MIN_SAMPLE}</Num> attempts
          </p>
          <p className="mt-1.5 text-sm text-text-3">
            {sample === 0 ? (
              <>Nothing counted here yet.</>
            ) : (
              <>
                You have <Num>{sample}</Num> {noun(key, sample)} so far.
              </>
            )}
          </p>
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed">
        <TrendLine trend={trend} comparisonLabel={comparisonLabel} />
      </p>

      <p className="mt-2 text-sm leading-relaxed text-text-2">{definition}</p>

      {nextAction ? (
        <details className="group mt-3">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-text-3 transition-colors hover:text-text-2 [&::-webkit-details-marker]:hidden">
            <Icon
              name="chevronDown"
              size={13}
              className="transition-transform duration-200 group-open:rotate-180"
            />
            Try next
          </summary>
          <p className="well mt-2 p-3 text-sm leading-relaxed">{nextAction}</p>
        </details>
      ) : null}

      <ProxyNote className="mt-auto pt-3" />
    </section>
  );
}

function TrendLine({
  trend,
  comparisonLabel,
}: {
  trend: number | null;
  comparisonLabel: string;
}) {
  if (trend === null) {
    return (
      <span className="text-text-3">
        No comparison with {comparisonLabel} yet. One of the two windows is
        under the <span className="num">{MIN_SAMPLE}</span>-item floor.
      </span>
    );
  }

  const size = Math.abs(trend);
  if (size < 0.5) {
    return <span>Level with {comparisonLabel}.</span>;
  }

  return (
    <span>
      {trend > 0 ? "Up" : "Down"} <Num>{Math.round(size)}</Num>{" "}
      {Math.round(size) === 1 ? "point" : "points"} on {comparisonLabel}.
    </span>
  );
}
