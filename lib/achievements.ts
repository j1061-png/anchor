import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

// Achievement definitions and the single server evaluation function (§6).
// The session-completion route calls evaluateAchievements after each session.
// NOTE: stub — the achievements module build fills in the 16+ definitions and
// the real evaluation queries. Interface is fixed; do not change signatures.

export interface AchievementDef {
  key: string;
  name: string;
  description: string; // shown when unlocked
  hint: string; // shown on the locked silhouette
}

export const ACHIEVEMENTS: AchievementDef[] = [];

// Returns the keys newly unlocked by this evaluation (already persisted).
export async function evaluateAchievements(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<string[]> {
  void admin;
  void userId;
  return [];
}
