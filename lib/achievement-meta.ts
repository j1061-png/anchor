import type { IconName } from "@/components/ui/icon";

/**
 * Achievement shape and grouping metadata.
 *
 * Split out of lib/achievements.ts, which is `server-only` because it also
 * carries the post-session evaluation. The grid needs the group labels at
 * runtime, so they live here where any surface can import them without
 * dragging the server module into a bundle.
 */

/**
 * The six groups an achievement belongs to. These existed only as source
 * comments, so the grid had no way to organise 21 tiles and rendered them as
 * one undifferentiated wall.
 */
export const ACHIEVEMENT_CATEGORIES = [
  "volume",
  "independence",
  "consistency",
  "mastery",
  "performance",
  "social",
] as const;
export type AchievementCategory = (typeof ACHIEVEMENT_CATEGORIES)[number];

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  volume: "Volume",
  independence: "Independence",
  consistency: "Consistency",
  mastery: "Category mastery",
  performance: "Performance",
  social: "Social",
};

/** One line saying what the group counts, shown under its heading. */
export const ACHIEVEMENT_CATEGORY_BLURBS: Record<AchievementCategory, string> = {
  volume: "How much work has gone through the app.",
  independence: "Work finished with no hint and no worked solution.",
  consistency: "Days in a row you came back and tried to recall something.",
  mastery: "Per-category ratings, each one on its own.",
  performance: "Single sessions and single puzzles that went unusually well.",
  social: "Friends and challenges. Neither needs a high score.",
};

/**
 * The counters a locked tile can show progress against. Only metrics cheap
 * enough to fetch alongside the page appear here — an achievement with no
 * entry shows its hint and no bar, which is honest rather than invented.
 */
export type AchievementMetric =
  | "sessions"
  | "solved"
  | "streak"
  | "bestRating"
  | "categoriesAt1400";

/** Current value of each metric for one user. Any key may be absent. */
export type AchievementProgress = Partial<Record<AchievementMetric, number>>;

export interface AchievementDef {
  key: string;
  name: string;
  description: string; // shown once earned
  hint: string; // shown on the locked tile
  category: AchievementCategory;
  icon: IconName;
  /**
   * Progress-toward for a locked tile: "7 of 10 solved". `noun` is the unit,
   * already plural. Omitted where the condition is a one-off event that cannot
   * be part-completed — a sub-10s solve either happened or it did not.
   */
  progress?: { metric: AchievementMetric; target: number; noun: string };
}
