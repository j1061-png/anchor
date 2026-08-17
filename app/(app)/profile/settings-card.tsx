"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cacheAiConsent } from "@/components/learn/ai-consent";
import type { ProfileRow } from "@/lib/database.types";

export interface SettingsCardProps {
  userId: string;
  // R3: opt-in to the improvement / independence boards. Default off.
  leaderboardOptIn: boolean;
  reminderTime: string | null; // "HH:MM" or null
  timezone: string;
  // 5.1.2(i): when the student agreed to their attempt text being sent to the
  // AI provider, or null for never / revoked.
  aiConsentAt: string | null;
}

function formatConsentDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "earlier";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function SettingsCard(props: SettingsCardProps) {
  const router = useRouter();
  const [publicBoard, setPublicBoard] = useState(props.leaderboardOptIn);
  const [aiConsent, setAiConsent] = useState(props.aiConsentAt !== null);
  const [aiConsentAt, setAiConsentAt] = useState(props.aiConsentAt);
  const [reminder, setReminder] = useState(props.reminderTime ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // App Store guideline 5.1.1(v): full account deletion, in-app, immediate.
  async function deleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Deletion failed. Try again.");
      }
      await createClient().auth.signOut();
      router.replace("/auth?deleted=1");
    } catch (e) {
      setDeleting(false);
      setDeleteError(e instanceof Error ? e.message : "Deletion failed. Try again.");
    }
  }

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  function flashSaved() {
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2000);
  }

  async function write(patch: Partial<ProfileRow>): Promise<boolean> {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update(patch as never)
      .eq("id", props.userId);
    if (updateError) return false;
    flashSaved();
    return true;
  }

  async function toggleLeaderboard() {
    const next = !publicBoard;
    setError(null);
    setPublicBoard(next); // optimistic
    const ok = await write({ leaderboard_opt_in: next });
    if (!ok) {
      setPublicBoard(!next);
      setError("The setting didn't save. Try again.");
    }
  }

  /**
   * 5.1.2(i). This is the only switch in the app that decides whether student
   * text reaches the AI provider, so it goes through `/api/consent` rather than
   * a direct column write — `profiles.ai_consent_at` is service-role only, for
   * the same reason xp and streaks are.
   *
   * The localStorage cache the learn screen reads is updated alongside it, so
   * turning AI off here takes effect on the next paint of the learn screen
   * rather than after the next server round trip.
   */
  async function toggleAiConsent() {
    const next = !aiConsent;
    setError(null);
    setAiConsent(next); // optimistic
    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ granted: next }),
      });
      if (!res.ok) throw new Error("failed");
      const body = (await res.json().catch(() => null)) as { consentedAt?: string | null } | null;
      setAiConsentAt(body?.consentedAt ?? null);
      cacheAiConsent(next);
      flashSaved();
    } catch {
      setAiConsent(!next);
      setError("The AI setting didn't save. Try again.");
    }
  }

  async function changeReminder(value: string) {
    const before = reminder;
    setError(null);
    setReminder(value); // optimistic
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return; // partial input
    const ok = await write({ reminder_time: value });
    if (!ok) {
      setReminder(before);
      setError("The reminder time didn't save. Try again.");
    }
  }

  return (
    <section className="plane p-5" aria-label="Settings">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold tracking-tight">
          Settings
        </h2>
        <span aria-live="polite" className="text-sm text-slate">
          {saved ? "Saved" : ""}
        </span>
      </div>

      <div
        id="sharing"
        className="mt-4 flex scroll-mt-24 items-start justify-between gap-4"
      >
        <div>
          <p id="public-board-label" className="text-sm font-semibold">
            Public boards and share cards
          </p>
          <p className="mt-0.5 text-xs text-slate">
            Off by default. On, you&apos;re compared with people at your level
            on how much you improve and how much you do without help, over the
            last seven days — never on a top score. It is also what lets a share
            card you send actually load for the person opening it. Off, those
            links show nothing.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={publicBoard}
          aria-labelledby="public-board-label"
          onClick={toggleLeaderboard}
          className="flex min-h-11 cursor-pointer items-center"
        >
          <span
            aria-hidden
            className={`flex h-7 w-12 items-center rounded-(--radius-ctl) border border-ink px-1 transition-colors ${
              publicBoard ? "justify-end bg-ink" : "justify-start bg-chalk"
            }`}
          >
            <span
              className={`size-4.5 rounded-[1px] ${
                publicBoard ? "bg-gold" : "bg-slate/60"
              }`}
            />
          </span>
        </button>
      </div>

      <div
        id="ai"
        className="mt-5 flex scroll-mt-24 items-start justify-between gap-4"
      >
        <div>
          <p id="ai-consent-label" className="text-sm font-semibold">
            AI hints and tutor
          </p>
          <p className="mt-0.5 text-xs text-slate">
            On, the question and the text you write — your attempts, your tutor
            messages, your explain-it-back — are sent to our AI provider
            (DeepSeek) to write hints, tutor replies and the written half of
            your end-of-item feedback. Off, none of that leaves Anchor: the
            hints and tutor stop, and marking, the worked solution, XP, reviews
            and your progress all carry on exactly as they are, because none of
            them has ever used AI.
            {aiConsent && aiConsentAt ? (
              <>
                {" "}
                Agreed {formatConsentDate(aiConsentAt)}.
              </>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={aiConsent}
          aria-labelledby="ai-consent-label"
          onClick={toggleAiConsent}
          className="flex min-h-11 cursor-pointer items-center"
        >
          <span
            aria-hidden
            className={`flex h-7 w-12 items-center rounded-(--radius-ctl) border border-ink px-1 transition-colors ${
              aiConsent ? "justify-end bg-ink" : "justify-start bg-chalk"
            }`}
          >
            <span
              className={`size-4.5 rounded-[1px] ${
                aiConsent ? "bg-gold" : "bg-slate/60"
              }`}
            />
          </span>
        </button>
      </div>

      <label className="mt-5 grid max-w-48 gap-1.5 text-sm font-semibold">
        Daily reminder
        <Input
          type="time"
          value={reminder}
          onChange={(e) => changeReminder(e.target.value)}
          className="num"
        />
      </label>

      <div className="mt-5 text-sm">
        <p className="font-semibold">Timezone</p>
        <p className="mt-0.5 text-slate">
          {props.timezone}. Streaks and daily sessions follow this zone.
        </p>
      </div>

      {error && (
        <p className="mt-3 text-sm text-flag" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 border-t border-slate/30 pt-4">
        <p className="text-sm font-semibold">Delete account</p>
        <p className="mt-0.5 text-xs text-slate">
          Immediate and permanent. Your profile, attempts, progress, streaks
          and friend connections are all erased. There is no
          &quot;deactivated&quot; state and no way back.
        </p>

        {!confirmingDelete ? (
          <Button
            type="button"
            variant="secondary"
            className="mt-3 min-h-11"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete my account
          </Button>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            <label className="grid gap-1.5 text-sm font-semibold">
              Type DELETE to confirm
              <Input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                autoComplete="off"
                className="max-w-48"
              />
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeleteText("");
                  setDeleteError(null);
                }}
                disabled={deleting}
              >
                Keep my account
              </Button>
              <Button
                type="button"
                onClick={deleteAccount}
                disabled={deleting || deleteText.trim() !== "DELETE"}
              >
                {deleting ? "Deleting…" : "Delete forever"}
              </Button>
            </div>
            {deleteError && (
              <p className="text-sm text-flag" role="alert">
                {deleteError}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
