import type { IconName } from "@/components/ui/icon";

/**
 * How each XP event is described to the student.
 *
 * The labels lead with what the student DID, not with the amount, because the
 * whole point of the independence-weighted economy is that finishing earns
 * nothing and doing it yourself earns the most.
 */
export type XpReason =
  | "independentSolution"
  | "transferSolved"
  | "persistenceAfterError"
  | "selfCorrection"
  | "selfExplanation"
  | "strategicHintUse"
  | "unnecessaryDependence"
  | "puzzleSession"
  | "learnItem"
  | "referral"
  | "openingBalance";

export type ReasonMeta = {
  label: string;
  /** One line on why this is worth what it is worth. */
  note: string;
  icon: IconName;
  /** Drives the accent colour on the timeline. */
  tone: "green" | "cobalt" | "gold" | "amber" | "neutral";
};

export const REASONS: Record<XpReason, ReasonMeta> = {
  independentSolution: {
    label: "Solved it yourself",
    note: "No hints, no solution. The most valuable thing you can do here.",
    icon: "brainOnly",
    tone: "green",
  },
  transferSolved: {
    label: "Applied it somewhere new",
    note: "You used the idea on a problem that did not look the same.",
    icon: "spark",
    tone: "green",
  },
  persistenceAfterError: {
    label: "Kept going after a wrong answer",
    note: "Staying with a problem after getting it wrong is where the learning is.",
    icon: "rotate",
    tone: "cobalt",
  },
  selfCorrection: {
    label: "Caught your own mistake",
    note: "You found the error before anything told you it was there.",
    icon: "check",
    tone: "cobalt",
  },
  selfExplanation: {
    label: "Explained it back",
    note: "Saying it in your own words tests whether the understanding is yours.",
    icon: "learn",
    tone: "cobalt",
  },
  strategicHintUse: {
    label: "Used a hint well",
    note: "You tried first, took one step of help, then finished it yourself.",
    icon: "target",
    tone: "amber",
  },
  unnecessaryDependence: {
    label: "Answer revealed",
    note: "Nothing scored. The solution was shown before the work was done.",
    icon: "lock",
    tone: "neutral",
  },
  puzzleSession: {
    label: "Daily session",
    note: "XP from the five puzzles, weighted by how much you did unaided.",
    icon: "today",
    tone: "cobalt",
  },
  learnItem: {
    label: "Learn item",
    note: "XP from a study problem, weighted by how independently you solved it.",
    icon: "learn",
    tone: "cobalt",
  },
  referral: {
    label: "A friend joined",
    note: "Someone signed up with your code.",
    icon: "users",
    tone: "gold",
  },
  openingBalance: {
    label: "Earlier progress",
    note: "XP you earned before Anchor started keeping a full history.",
    icon: "clock",
    tone: "neutral",
  },
};

export function reasonMeta(key: string): ReasonMeta {
  return (
    REASONS[key as XpReason] ?? {
      label: key,
      note: "",
      icon: "spark",
      tone: "neutral",
    }
  );
}

/** level = floor(sqrt(xp / 100)) — kept in sync with lib/types.ts. */
export const xpForLevel = (level: number) => level * level * 100;

export function levelProgress(xp: number) {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 100));
  const floorXp = xpForLevel(level);
  const ceilXp = xpForLevel(level + 1);
  const span = ceilXp - floorXp;
  return {
    level,
    floorXp,
    ceilXp,
    intoLevel: xp - floorXp,
    needed: ceilXp - xp,
    fraction: span > 0 ? (xp - floorXp) / span : 0,
  };
}
