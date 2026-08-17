import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProgressStats, ShareRange } from "./share";

/**
 * The database side of a progress share card. The vocabulary, types and
 * caption live in lib/share.ts, which is client-safe; this file is server-only
 * because it talks to Supabase.
 *
 * Every field is a count of something that happened inside Anchor. Anything
 * the database could not answer comes back `null` rather than 0, so a card
 * never states a number it does not have.
 */

const DAY_MS = 86_400_000;

/** ISO timestamp for the start of the window, or null for "all time". */
function windowStart(range: ShareRange): string | null {
  return range === "all"
    ? null
    : new Date(Date.now() - 7 * DAY_MS).toISOString();
}

/**
 * Counts the effort figures for one user over one window.
 *
 * `db` is untyped on purpose: brain_only_sessions arrived with the research
 * migration and is not in lib/database.types.ts yet, and both the admin client
 * (og route) and the user-scoped client (profile / progress pages) need to run
 * this. Both are safe — every query is filtered to the one user id.
 */
export async function loadProgressStats(
  db: SupabaseClient,
  userId: string,
  range: ShareRange,
  recallDays: number,
): Promise<ProgressStats> {
  const since = windowStart(range);
  const count = { count: "exact" as const, head: true };

  const unaidedQuery = db
    .from("attempts")
    .select("id", count)
    .eq("user_id", userId)
    .eq("hints_used", 0)
    .eq("correct", true);
  const finishedQuery = db
    .from("attempts")
    .select("id", count)
    .eq("user_id", userId);
  const brainOnlyQuery = db
    .from("brain_only_sessions")
    .select("id", count)
    .eq("user_id", userId)
    .not("completed_at", "is", null);
  const milestoneQuery = db
    .from("achievements")
    .select("id", count)
    .eq("user_id", userId);

  const [unaided, finished, brainOnly, milestones] = await Promise.all([
    since ? unaidedQuery.gte("created_at", since) : unaidedQuery,
    since ? finishedQuery.gte("created_at", since) : finishedQuery,
    since ? brainOnlyQuery.gte("completed_at", since) : brainOnlyQuery,
    since ? milestoneQuery.gte("unlocked_at", since) : milestoneQuery,
  ]);

  return {
    unaidedSolves: unaided.count ?? 0,
    finished: finished.count ?? 0,
    // A failed query must not become a confident zero on a public card.
    brainOnly: brainOnly.error ? null : (brainOnly.count ?? 0),
    milestones: milestones.count ?? 0,
    recallDays,
  };
}
