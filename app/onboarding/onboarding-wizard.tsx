"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarPicker } from "@/components/ui/avatar";
import { Calibration, type CalibrationResults } from "./calibration";

export const YEAR_GROUPS = [
  "Year 9", "Year 10", "Year 11", "Year 12", "Year 13", "Uni", "Other",
] as const;

const STEP_TITLES = [
  "Say hello before you dive in",
  "Where you study",
  "Three quick checks",
  "Daily reminder",
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [school, setSchool] = useState("");
  const [schoolPicked, setSchoolPicked] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [yearGroup, setYearGroup] = useState("");
  const [calibration, setCalibration] = useState<CalibrationResults | null>(null);
  const [reminderTime, setReminderTime] = useState("16:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = school.trim();
    if (step !== 1 || schoolPicked || q.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/schools?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const body = (await res.json()) as { schools?: string[] };
        setSuggestions((body.schools ?? []).filter((s) => s !== q));
      } catch { /* noop */ }
    }, 200);
    return () => clearTimeout(t);
  }, [school, schoolPicked, step]);

  async function finish() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim(),
          avatar_emoji: avatarId,
          school: school.trim() || null,
          year_group: yearGroup,
          reminder_time: reminderTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          calibration: calibration ?? { pattern: false, mental_math: false, memory: false },
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Saving didn't finish. Try again.");
        setSubmitting(false);
        return;
      }
      router.replace("/today");
    } catch {
      setError("The request didn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="hero-card w-full p-6 sm:p-8 deal-in">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-navy text-white">
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="4" y="4" width="7" height="7" rx="1.5" />
            <rect x="13" y="4" width="7" height="7" rx="1.5" />
            <rect x="4" y="13" width="7" height="7" rx="1.5" />
            <rect x="13" y="13" width="7" height="7" rx="1.5" />
          </svg>
        </span>
        <p className="mt-4 text-xs text-slate">Welcome to anchor</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          {STEP_TITLES[step]}
        </h1>
        {step === 0 && (
          <p className="mt-2 max-w-sm text-sm text-slate">
            Everyone here starts with a name and an icon. It takes a minute — then
            you&apos;re into your first brain workout.
          </p>
        )}
      </div>

      <div className="mt-2 flex justify-center gap-1.5" role="img" aria-label={`step ${step + 1} of 4`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? "bg-navy" : "bg-mist"}`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="mt-6 grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-navy">
            Display name
            <div className="input-pill">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={24}
                autoComplete="nickname"
                placeholder="What the leaderboard calls you"
                className="flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </label>
          <AvatarPicker value={avatarId} onChange={setAvatarId} />
          <Button type="button" disabled={displayName.trim().length === 0} onClick={() => setStep(1)} className="w-full">
            Continue
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="mt-6 grid gap-4">
          <div className="relative">
            <label className="grid gap-2 text-sm font-semibold text-navy">
              School
              <Input value={school} onChange={(e) => { setSchool(e.target.value); setSchoolPicked(false); }} maxLength={120} placeholder="Classmates share a board" />
            </label>
            {suggestions.length > 0 && (
              <ul className="plane-sm absolute inset-x-0 top-full z-10 mt-1 overflow-hidden">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button type="button" className="w-full px-3 py-2.5 text-left text-sm hover:bg-mist/60" onClick={() => { setSchool(s); setSchoolPicked(true); setSuggestions([]); }}>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <label className="grid gap-2 text-sm font-semibold text-navy">
            Year group
            <select value={yearGroup} onChange={(e) => setYearGroup(e.target.value)} className="w-full rounded-(--radius-ctl) border border-ink/10 bg-chalk px-3 py-2.5 text-sm">
              <option value="" disabled>Choose one</option>
              {YEAR_GROUPS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep(0)}>Back</Button>
            <Button type="button" className="flex-1" disabled={yearGroup === ""} onClick={() => setStep(2)}>Next</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6">
          <p className="text-sm text-slate">One from each category — sets your starting difficulty.</p>
          <div className="mt-4">
            <Calibration onDone={(results) => { setCalibration(results); setStep(3); }} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 grid gap-4">
          <p className="text-sm text-slate">One nudge a day, at a time you pick.</p>
          <label className="grid gap-2 text-sm font-semibold text-navy">
            Reminder time
            <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="num" required />
          </label>
          {error && <p className="text-sm text-flag" role="alert">{error}</p>}
          <Button type="button" disabled={submitting} onClick={finish} className="w-full">
            {submitting ? "Setting up…" : "Start training"}
          </Button>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-slate">You&apos;ll only be asked this once.</p>
    </div>
  );
}
