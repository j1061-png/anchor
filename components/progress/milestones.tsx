import type { Milestone } from "@/lib/progress-data";
import { Icon } from "@/components/ui/icon";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const styles = {
  achievement: {
    icon: "trophy" as const,
    ring: "border-[color-mix(in_oklab,var(--gold)_45%,transparent)]",
    bg: "bg-[color-mix(in_oklab,var(--gold)_14%,transparent)]",
    fg: "text-[var(--gold)]",
  },
  level: {
    icon: "spark" as const,
    ring: "border-brand/40",
    bg: "bg-[var(--brand-soft)]",
    fg: "text-brand",
  },
  start: {
    icon: "today" as const,
    ring: "border-[var(--line-strong)]",
    bg: "bg-raised",
    fg: "text-text-3",
  },
};

/** The vertical spine: what you reached, and when. Newest first. */
export function Milestones({ milestones }: { milestones: Milestone[] }) {
  const ordered = [...milestones].reverse();

  if (ordered.length === 0) {
    return (
      <div className="well p-6 text-center">
        <p className="text-sm font-semibold">No milestones yet</p>
        <p className="mt-1 text-sm text-text-2">
          Levels and achievements appear here with the date you reached them.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative">
      {/* The spine */}
      <span
        aria-hidden
        className="absolute bottom-4 left-[1.1875rem] top-4 w-px bg-[var(--line)]"
      />
      {ordered.map((m, i) => {
        const s = styles[m.kind];
        return (
          <li
            key={m.key + m.at}
            style={{ ["--i" as string]: i }}
            className="stagger relative flex gap-4 pb-6 last:pb-0"
          >
            <span
              className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border ${s.ring} ${s.bg} ${s.fg}`}
            >
              <Icon name={s.icon} size={18} />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <p className="font-semibold">{m.label}</p>
                <p className="num text-xs text-text-3">{fmt(m.at)}</p>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-text-2">
                {m.description}
              </p>
              {m.kind !== "start" && (
                <p className="num mt-1.5 text-xs text-text-3">
                  {m.xp.toLocaleString()} XP at the time
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
