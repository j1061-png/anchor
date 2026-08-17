/**
 * The shape and vocabulary of a progress share card.
 *
 * Per lib/why.ts → `sharing`, a shared card leads with effort: work finished
 * with no help, days of retrieval practice, sessions run with the assistance
 * absent, milestones reached. There is deliberately no score here and no
 * accuracy percentage — a high number with help is not an achievement.
 *
 * Client-safe on purpose. The database side lives in lib/share-stats.ts, which
 * is server-only; the preview component needs these labels in the browser.
 */

export type ShareRange = "week" | "all";

export const SHARE_RANGES: ShareRange[] = ["week", "all"];

/** How the window is named on the card itself. */
export const RANGE_LABEL: Record<ShareRange, string> = {
  week: "Last 7 days",
  all: "All time",
};

/** How the window is named on the control that picks it. */
export const RANGE_TAB: Record<ShareRange, string> = {
  week: "This week",
  all: "All time",
};

export function parseRange(value: string | null | undefined): ShareRange {
  return value === "all" ? "all" : "week";
}

export interface ProgressStats {
  /** Items got right with no hint and no worked solution. */
  unaidedSolves: number;
  /** Items finished at all in the window — the denominator, stated plainly. */
  finished: number;
  /** Completed brain-only sessions. Null when the count is unavailable. */
  brainOnly: number | null;
  /** Achievements unlocked. */
  milestones: number;
  /** Consecutive days with a real retrieval attempt. Window-independent. */
  recallDays: number;
}

/** The one-line caption that travels with the card. Effort, never a score. */
export function shareCaption(
  stats: ProgressStats,
  range: ShareRange,
  includeStreak: boolean,
): string {
  const window = range === "week" ? "this week" : "so far";
  const solves = `${stats.unaidedSolves} solved with no help ${window} on Anchor.`;
  if (includeStreak && stats.recallDays > 0) {
    return `${solves} ${stats.recallDays} ${
      stats.recallDays === 1 ? "day" : "days"
    } of recall practice.`;
  }
  return solves;
}
