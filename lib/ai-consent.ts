import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// The one place that decides whether student text may be sent to the AI
// provider (App Store guideline 5.1.2(i)).
//
// The consent card used to write localStorage and nothing else, so the server
// sent every attempt to the model regardless. Consent is now a column on
// `profiles` and this module is what the learn routes read before any model
// call. Two rules:
//
//   1. Absent consent means absent AI, not degraded AI with a warning. Nothing
//      the student typed leaves the app.
//   2. It never touches grading. `lib/research/grader.ts` is deterministic and
//      runs for everyone, consent or not — a student who says no still gets
//      marked, still earns XP, and still gets the verified worked solution.
//
// Fails closed. If the profile cannot be read we treat consent as absent: the
// cost is a student losing hints during a database outage, and the cost of the
// other default is text sent to a third party by someone who declined.

/** Student-facing 403 copy for the routes that exist only to call the model. */
export const AI_HELP_OFF =
  "AI help is off for your account, so nothing you write is sent to the AI provider. " +
  "Turn it on in Profile → Settings → AI hints and tutor. Marking, the worked solution and your progress work without it.";

/** True only when the profile carries a consent timestamp. */
export async function hasAiConsent(userId: string): Promise<boolean> {
  try {
    const { data, error } = await createAdminClient()
      .from("profiles")
      .select("ai_consent_at")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("[ai-consent] could not read consent:", error.message);
      return false;
    }
    return typeof data?.ai_consent_at === "string" && data.ai_consent_at.length > 0;
  } catch (error) {
    console.error("[ai-consent] could not read consent:", error);
    return false;
  }
}

/**
 * Grants or revokes. Revoking writes null rather than a flag, so there is no
 * state where a row remembers a consent that no longer applies. Returns the
 * stored timestamp, or null once revoked.
 */
export async function setAiConsent(
  userId: string,
  granted: boolean,
): Promise<{ ok: true; consentedAt: string | null } | { ok: false }> {
  const consentedAt = granted ? new Date().toISOString() : null;
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ ai_consent_at: consentedAt })
    .eq("id", userId);
  if (error) {
    console.error("[ai-consent] could not write consent:", error.message);
    return { ok: false };
  }
  return { ok: true, consentedAt };
}
