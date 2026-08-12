"use client";

import type { ReactNode } from "react";
import { AVATARS, avatarDef, isAvatarId } from "@/lib/avatars";

function AvatarSvg({ id, className = "size-5" }: { id: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    compass: (
      <>
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
        <path d="M12 8l2 6-6-2 6-2-2 6z" fill="currentColor" stroke="none" />
      </>
    ),
    spark: (
      <>
        <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
      </>
    ),
    wave: (
      <path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    ),
    peak: (
      <path d="M4 18l4-8 4 5 4-10 4 13" />
    ),
    orbit: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="16" cy="10" r="2" fill="currentColor" stroke="none" />
      </>
    ),
    pulse: (
      <path d="M4 12h3l2-6 4 12 2-6h5" />
    ),
    node: (
      <>
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      </>
    ),
    arc: (
      <path d="M6 16c0-4 3-8 6-8s6 4 6 8" />
    ),
    prism: (
      <path d="M12 4l8 14H4L12 4z" />
    ),
    vertex: (
      <>
        <path d="M12 4v16M4 12h16" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </>
    ),
    bolt: (
      <path d="M13 3L5 14h6l-1 7 8-12h-6l1-6z" fill="currentColor" stroke="none" />
    ),
    anchor: (
      <>
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v12M8 19c2 2 4 2 4 2s2 0 4-2M7 11h10" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[id] ?? paths.anchor}
    </svg>
  );
}

export interface AvatarProps {
  avatarId: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { box: "size-8", icon: "size-4", text: "text-xs" },
  md: { box: "size-10", icon: "size-5", text: "text-sm" },
  lg: { box: "size-14", icon: "size-7", text: "text-base" },
};

export function Avatar({ avatarId, name, size = "md", className = "" }: AvatarProps) {
  const def = isAvatarId(avatarId) ? avatarDef(avatarId) : null;
  const s = SIZES[size];

  if (def) {
    return (
      <span
        aria-hidden
        className={`flex shrink-0 items-center justify-center rounded-xl text-white ${s.box} ${className}`}
        style={{ background: def.color }}
      >
        <AvatarSvg id={def.id} className={s.icon} />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-xl bg-navy text-white font-semibold ${s.box} ${s.text} ${className}`}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export interface AvatarPickerProps {
  value: string | null;
  onChange: (id: string | null) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate">
        Pick your icon <span className="font-normal">(optional)</span>
      </legend>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {AVATARS.map((a) => {
          const selected = value === a.id;
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={selected}
              aria-label={a.label}
              onClick={() => onChange(selected ? null : a.id)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all ${
                selected
                  ? "border-navy bg-navy/5 shadow-md ring-2 ring-navy/20"
                  : "border-ink/8 bg-chalk hover:border-navy/20 hover:shadow-sm"
              }`}
            >
              <span
                className="flex size-10 items-center justify-center rounded-xl text-white"
                style={{ background: a.color }}
              >
                <AvatarSvg id={a.id} className="size-5" />
              </span>
              <span className="text-[10px] font-medium text-slate">{a.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
