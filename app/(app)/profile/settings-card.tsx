"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import type { ProfileRow } from "@/lib/database.types";

export interface SettingsCardProps {
  userId: string;
  publicLeaderboard: boolean;
  reminderTime: string | null; // "HH:MM" or null
  timezone: string;
}

export function SettingsCard(props: SettingsCardProps) {
  const [publicBoard, setPublicBoard] = useState(props.publicLeaderboard);
  const [reminder, setReminder] = useState(props.reminderTime ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const ok = await write({ public_leaderboard: next });
    if (!ok) {
      setPublicBoard(!next);
      setError("The setting didn't save. Try again.");
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

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p id="public-board-label" className="text-sm font-semibold">
            Show me on public leaderboards
          </p>
          <p className="mt-0.5 text-xs text-slate">
            Off removes you from global, weekly and school boards. Friends
            still see you.
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
    </section>
  );
}
