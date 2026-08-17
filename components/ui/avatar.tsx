import type { ReactElement } from "react";

/**
 * Anchor's avatar set.
 *
 * These used to be raw emoji, which render differently on every platform and
 * were the last piece of chrome the design system did not own. Each mark is
 * an original geometric animal drawn from the same primitives as the puzzle
 * blocks — chunky shapes, flat fills, readable at 24px.
 *
 * The database still stores the original emoji string on profiles.avatar_emoji;
 * it is treated as an opaque token and mapped to art here at render time, so
 * no migration was needed and old clients keep working.
 */

export type AvatarId =
  | "fox"
  | "frog"
  | "owl"
  | "octopus"
  | "rex"
  | "bee"
  | "turtle"
  | "shark"
  | "rabbit"
  | "beaver"
  | "croc"
  | "flamingo"
  | "ladybird"
  | "goat"
  | "seal"
  | "snail"
  | "eagle"
  | "wolf"
  | "butterfly"
  | "penguin"
  | "elephant"
  | "hedgehog"
  | "leopard"
  | "whale";

/** Stored token → avatar id. The tokens happen to be the old emoji. */
const TOKEN_TO_ID: Record<string, AvatarId> = {
  "🦊": "fox",
  "🐸": "frog",
  "🦉": "owl",
  "🐙": "octopus",
  "🦖": "rex",
  "🐝": "bee",
  "🐢": "turtle",
  "🦈": "shark",
  "🐇": "rabbit",
  "🦫": "beaver",
  "🐊": "croc",
  "🦩": "flamingo",
  "🐞": "ladybird",
  "🐐": "goat",
  "🦭": "seal",
  "🐌": "snail",
  "🦅": "eagle",
  "🐺": "wolf",
  "🦋": "butterfly",
  "🐧": "penguin",
  "🐘": "elephant",
  "🦔": "hedgehog",
  "🐆": "leopard",
  "🐋": "whale",
};

export const AVATAR_TOKENS = Object.keys(TOKEN_TO_ID);

export function avatarIdFor(token: string | null | undefined): AvatarId | null {
  if (!token) return null;
  return TOKEN_TO_ID[token] ?? null;
}

/* --------------------------------------------------------------------------
   Palette. Six hues from the puzzle-block scale, assigned so neighbouring
   picker tiles differ. `h` = the hue variable, used for disc tint + details.
   -------------------------------------------------------------------------- */

const HUES: Record<AvatarId, string> = {
  fox: "var(--block-2)",
  frog: "var(--block-3)",
  owl: "var(--block-1)",
  octopus: "var(--block-6)",
  rex: "var(--block-5)",
  bee: "var(--gold)",
  turtle: "var(--block-3)",
  shark: "var(--block-4)",
  rabbit: "var(--block-1)",
  beaver: "var(--block-2)",
  croc: "var(--block-5)",
  flamingo: "var(--brand)",
  ladybird: "var(--block-6)",
  goat: "var(--block-4)",
  seal: "var(--block-1)",
  snail: "var(--block-2)",
  eagle: "var(--block-4)",
  wolf: "var(--block-1)",
  butterfly: "var(--brand)",
  penguin: "var(--block-4)",
  elephant: "var(--block-1)",
  hedgehog: "var(--block-2)",
  leopard: "var(--gold)",
  whale: "var(--block-4)",
};

/* --------------------------------------------------------------------------
   The marks. 48×48 viewBox, drawn with h (hue), d (dark detail), l (light).
   Kept deliberately chunky: every mark must survive 24px.
   -------------------------------------------------------------------------- */

type Ink = { h: string; d: string; l: string };

const MARKS: Record<AvatarId, (ink: Ink) => ReactElement> = {
  fox: ({ h, d, l }) => (
    <>
      <path d="M9 12 L17 20 H31 L39 12 L38 26 C38 35 32 40 24 40 C16 40 10 35 10 26 Z" fill={h} />
      <path d="M9 12 L17 20 L13 24 Z" fill={d} />
      <path d="M39 12 L31 20 L35 24 Z" fill={d} />
      <path d="M24 40 C20 40 16.5 38.7 14.2 36.4 L24 28 L33.8 36.4 C31.5 38.7 28 40 24 40 Z" fill={l} />
      <circle cx="18.5" cy="26" r="2" fill={d} />
      <circle cx="29.5" cy="26" r="2" fill={d} />
      <path d="M24 33.4 L21.4 30.8 H26.6 Z" fill={d} />
    </>
  ),
  frog: ({ h, d, l }) => (
    <>
      <circle cx="15" cy="14" r="6.5" fill={h} />
      <circle cx="33" cy="14" r="6.5" fill={h} />
      <circle cx="15" cy="13" r="3" fill={l} />
      <circle cx="33" cy="13" r="3" fill={l} />
      <circle cx="15" cy="13" r="1.5" fill={d} />
      <circle cx="33" cy="13" r="1.5" fill={d} />
      <path d="M8 26 C8 19.5 15 16 24 16 C33 16 40 19.5 40 26 C40 33.5 33 39 24 39 C15 39 8 33.5 8 26 Z" fill={h} />
      <path d="M15 29 Q24 35 33 29" stroke={d} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </>
  ),
  owl: ({ h, d, l }) => (
    <>
      <path d="M10 10 H38 V30 C38 37.7 31.7 42 24 42 C16.3 42 10 37.7 10 30 Z" fill={h} />
      <path d="M10 10 L16 16 M38 10 L32 16" stroke={d} strokeWidth="3" strokeLinecap="round" />
      <circle cx="17.5" cy="24" r="6" fill={l} />
      <circle cx="30.5" cy="24" r="6" fill={l} />
      <circle cx="17.5" cy="24" r="2.4" fill={d} />
      <circle cx="30.5" cy="24" r="2.4" fill={d} />
      <path d="M24 29 L21 33.6 H27 Z" fill={d} />
    </>
  ),
  octopus: ({ h, d, l }) => (
    <>
      <path d="M12 22 C12 14 17 9 24 9 C31 9 36 14 36 22 V28 H12 Z" fill={h} />
      <path d="M10 40 C12 36 12 32 12 28 H17 C17 33 16 37 14 40 Z" fill={h} />
      <path d="M20 41 C21 37 21 32 21 28 H26 C26 32 26 37 27 41 Z" fill={h} />
      <path d="M33 40 C31 37 30 33 30 28 H36 C36 32 36 36 38 40 Z" fill={h} />
      <circle cx="19" cy="20" r="2.2" fill={l} />
      <circle cx="29" cy="20" r="2.2" fill={l} />
      <circle cx="19" cy="20" r="1.1" fill={d} />
      <circle cx="29" cy="20" r="1.1" fill={d} />
    </>
  ),
  rex: ({ h, d, l }) => (
    <>
      <path d="M12 40 V14 C12 10.7 14.7 8 18 8 H36 V18 H26 V22 H34 V30 H26 V40 Z" fill={h} />
      <circle cx="20" cy="14" r="2.2" fill={l} />
      <path d="M28 8 V12 M32 14 L32 18" stroke={d} strokeWidth="0" />
      <path d="M29 18 L31 14 L33 18 Z" fill={l} />
      <path d="M12 40 H26 V36 H12 Z" fill={d} opacity="0.25" />
    </>
  ),
  bee: ({ h, d, l }) => (
    <>
      <ellipse cx="15" cy="12" rx="7" ry="5" fill={l} opacity="0.85" />
      <ellipse cx="33" cy="12" rx="7" ry="5" fill={l} opacity="0.85" />
      <path d="M10 27 C10 19.8 16.3 15 24 15 C31.7 15 38 19.8 38 27 C38 34.2 31.7 40 24 40 C16.3 40 10 34.2 10 27 Z" fill={h} />
      <path d="M13 20 H35 M11 27 H37 M13 34 H35" stroke={d} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M24 40 L22 44 H26 Z" fill={d} />
    </>
  ),
  turtle: ({ h, d, l }) => (
    <>
      <circle cx="24" cy="24" r="15" fill={h} />
      <path d="M24 12 L28 18 H20 Z M35 17 L34 24 L29 20 Z M13 17 L14 24 L19 20 Z M33 33 L27 31 L31 26 Z M15 33 L21 31 L17 26 Z" fill={d} opacity="0.45" />
      <path d="M24 17.6 L28.6 24 L24 30.4 L19.4 24 Z" fill={l} />
      <path d="M40 20 C43 21 43 27 40 28" stroke={h} strokeWidth="4" strokeLinecap="round" fill="none" />
    </>
  ),
  shark: ({ h, d, l }) => (
    <>
      <path d="M24 6 L31 16 H17 Z" fill={h} />
      <path d="M8 30 C8 22 15 17 24 17 C33 17 40 22 40 30 C40 34 37 37 33 37 H15 C11 37 8 34 8 30 Z" fill={h} />
      <path d="M12 33 C16 30 32 30 36 33 C33 36 15 36 12 33 Z" fill={l} />
      <circle cx="17" cy="25" r="2" fill={d} />
      <circle cx="31" cy="25" r="2" fill={d} />
      <path d="M20 34 L22 31 M24 34.5 L24 31 M28 34 L26 31" stroke={d} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  rabbit: ({ h, d, l }) => (
    <>
      <path d="M15 4 C19 8 20 13 19.5 18 L12.5 20 C11 14 12 8 15 4 Z" fill={h} />
      <path d="M33 4 C29 8 28 13 28.5 18 L35.5 20 C37 14 36 8 33 4 Z" fill={h} />
      <path d="M15.5 6.5 C18 9.5 18.8 13 18.6 16.4 L14.4 17.6 C13.5 13 14 9.5 15.5 6.5 Z" fill={l} />
      <path d="M32.5 6.5 C30 9.5 29.2 13 29.4 16.4 L33.6 17.6 C34.5 13 34 9.5 32.5 6.5 Z" fill={l} />
      <circle cx="24" cy="29" r="13" fill={h} />
      <circle cx="19" cy="27" r="2" fill={d} />
      <circle cx="29" cy="27" r="2" fill={d} />
      <path d="M24 31.5 L22 34 H26 Z" fill={d} />
    </>
  ),
  beaver: ({ h, d, l }) => (
    <>
      <circle cx="15" cy="12" r="5" fill={h} />
      <circle cx="33" cy="12" r="5" fill={h} />
      <path d="M9 26 C9 17.7 15.7 12 24 12 C32.3 12 39 17.7 39 26 C39 34.3 32.3 40 24 40 C15.7 40 9 34.3 9 26 Z" fill={h} />
      <circle cx="18" cy="23" r="2" fill={d} />
      <circle cx="30" cy="23" r="2" fill={d} />
      <ellipse cx="24" cy="29" rx="4" ry="3" fill={d} />
      <path d="M21 31 H23.4 V37 H21 Z M24.6 31 H27 V37 H24.6 Z" fill={l} />
    </>
  ),
  croc: ({ h, d, l }) => (
    <>
      <circle cx="14" cy="13" r="4.5" fill={h} />
      <circle cx="34" cy="13" r="4.5" fill={h} />
      <circle cx="14" cy="12.5" r="1.8" fill={d} />
      <circle cx="34" cy="12.5" r="1.8" fill={d} />
      <path d="M8 24 C8 18 15 15 24 15 C33 15 40 18 40 24 V28 C40 34 33 38 24 38 C15 38 8 34 8 28 Z" fill={h} />
      <path d="M12 28 H36" stroke={d} strokeWidth="2" strokeLinecap="round" />
      <path d="M15 28 L16.8 31.6 L18.6 28 M22 28 L23.8 31.6 L25.6 28 M29 28 L30.8 31.6 L32.6 28" fill={l} />
    </>
  ),
  flamingo: ({ h, d, l }) => (
    <>
      <path d="M30 8 C37 8 41 13 41 19 C41 23 39 26 36 27.5 L34 20 C33 14 32 11 30 8 Z" fill={h} />
      <path d="M30 8 C24 8 20 12 20 18 V30 H28 V19 C28 14 28.8 10.6 30 8 Z" fill={h} />
      <path d="M20 30 C13 30 9 26 8 21 C12 23 16 23.5 20 23 Z" fill={h} />
      <path d="M41 19 H46 L43 23 C42 22 41.4 20.6 41 19 Z" fill={d} />
      <circle cx="37" cy="15" r="1.6" fill={d} />
      <path d="M23 30 V42 M23 42 L20 45 M23 42 L26 45" stroke={d} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="24" r="0" fill={l} />
    </>
  ),
  ladybird: ({ h, d, l }) => (
    <>
      <path d="M24 8 C15 8 8 15.2 8 24.5 C8 33.8 15 41 24 41 C33 41 40 33.8 40 24.5 C40 15.2 33 8 24 8 Z" fill={h} />
      <path d="M24 8 C20 8 17 10 15.5 12.5 H32.5 C31 10 28 8 24 8 Z" fill={d} />
      <path d="M24 12.5 V41" stroke={d} strokeWidth="2.4" />
      <circle cx="16.5" cy="21" r="2.6" fill={d} />
      <circle cx="31.5" cy="21" r="2.6" fill={d} />
      <circle cx="14.5" cy="31" r="2.6" fill={d} />
      <circle cx="33.5" cy="31" r="2.6" fill={d} />
      <circle cx="24" cy="27" r="0" fill={l} />
    </>
  ),
  goat: ({ h, d, l }) => (
    <>
      <path d="M10 6 C10 12 13 16 17 18 L21 13 C17 11 13 9 10 6 Z" fill={d} />
      <path d="M38 6 C38 12 35 16 31 18 L27 13 C31 11 35 9 38 6 Z" fill={d} />
      <path d="M13 22 C13 15.8 17.9 12 24 12 C30.1 12 35 15.8 35 22 V28 C35 35.2 30.1 40 24 40 C17.9 40 13 35.2 13 28 Z" fill={h} />
      <circle cx="19" cy="24" r="2" fill={d} />
      <circle cx="29" cy="24" r="2" fill={d} />
      <path d="M20 33 C22 34.6 26 34.6 28 33" stroke={d} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M22 40 C22 42.5 26 42.5 26 40 Z" fill={l} />
    </>
  ),
  seal: ({ h, d, l }) => (
    <>
      <circle cx="24" cy="22" r="14" fill={h} />
      <path d="M8 40 C12 36 16 34.5 20 34 L18 40 Z M40 40 C36 36 32 34.5 28 34 L30 40 Z" fill={h} />
      <circle cx="18" cy="20" r="2.2" fill={d} />
      <circle cx="30" cy="20" r="2.2" fill={d} />
      <ellipse cx="24" cy="26" rx="3" ry="2.2" fill={d} />
      <path d="M18 28.5 C20 30.5 22 31 24 31 C26 31 28 30.5 30 28.5" stroke={l} strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  snail: ({ h, d, l }) => (
    <>
      <circle cx="29" cy="22" r="13" fill={h} />
      <circle cx="29" cy="22" r="8" fill={l} />
      <circle cx="29" cy="22" r="3.4" fill={d} />
      <path d="M12 14 V26 M12 14 C12 11 10 10 9 9 M12 14 C12 11 14 10 15 9" stroke={d} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M6 34 C8 31 11 30 14 30 H36 C39 30 41 32 41 34.5 C41 37 39 39 36 39 H12 C9.5 39 7.5 37 6 34 Z" fill={h} />
      <circle cx="10.6" cy="16.5" r="1.6" fill={d} />
      <circle cx="13.4" cy="16.5" r="1.6" fill={d} />
    </>
  ),
  eagle: ({ h, d, l }) => (
    <>
      <path d="M4 14 C10 8 18 7 24 12 C30 7 38 8 44 14 C38 15 34 18 32 22 H16 C14 18 10 15 4 14 Z" fill={d} />
      <path d="M14 22 C14 15.9 18.5 12 24 12 C29.5 12 34 15.9 34 22 V28 C34 35 29.5 40 24 40 C18.5 40 14 35 14 28 Z" fill={h} />
      <circle cx="19.5" cy="23" r="2.2" fill={d} />
      <circle cx="28.5" cy="23" r="2.2" fill={d} />
      <path d="M24 27 L20.6 30.5 L24 34 L27.4 30.5 Z" fill={l} />
    </>
  ),
  wolf: ({ h, d, l }) => (
    <>
      <path d="M11 6 L19 14 L13 20 Z" fill={h} />
      <path d="M37 6 L29 14 L35 20 Z" fill={h} />
      <path d="M11 6 L16.5 11.5 L13 15 Z" fill={d} />
      <path d="M37 6 L31.5 11.5 L35 15 Z" fill={d} />
      <path d="M12 20 C12 14 17 11 24 11 C31 11 36 14 36 20 L34 30 C33 36 29 40 24 40 C19 40 15 36 14 30 Z" fill={h} />
      <path d="M24 24 L28 30 C28 33 26.5 34.5 24 34.5 C21.5 34.5 20 33 20 30 Z" fill={l} />
      <circle cx="18.5" cy="22" r="2" fill={d} />
      <circle cx="29.5" cy="22" r="2" fill={d} />
      <circle cx="24" cy="31" r="1.8" fill={d} />
    </>
  ),
  butterfly: ({ h, d, l }) => (
    <>
      <path d="M22 24 C14 14 8 12 6 15 C4 18 7 26 15 28 C9 31 7 36 10 39 C13 42 19 38 22 30 Z" fill={h} />
      <path d="M26 24 C34 14 40 12 42 15 C44 18 41 26 33 28 C39 31 41 36 38 39 C35 42 29 38 26 30 Z" fill={h} />
      <circle cx="13" cy="20" r="2.4" fill={l} />
      <circle cx="35" cy="20" r="2.4" fill={l} />
      <path d="M24 15 C22.7 15 22 16 22 17.5 V36 C22 38 23 39 24 39 C25 39 26 38 26 36 V17.5 C26 16 25.3 15 24 15 Z" fill={d} />
      <path d="M22.6 15.5 C21 13 19.5 11.5 18 10.5 M25.4 15.5 C27 13 28.5 11.5 30 10.5" stroke={d} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </>
  ),
  penguin: ({ h, d, l }) => (
    <>
      <path d="M12 22 C12 13 17 7 24 7 C31 7 36 13 36 22 V30 C36 37 31 41 24 41 C17 41 12 37 12 30 Z" fill={h} />
      <path d="M17 24 C17 18 20 14.5 24 14.5 C28 14.5 31 18 31 24 V32 C31 36.5 28 39 24 39 C20 39 17 36.5 17 32 Z" fill={l} />
      <circle cx="19.5" cy="15" r="2" fill={l} />
      <circle cx="28.5" cy="15" r="2" fill={l} />
      <circle cx="19.5" cy="15" r="1" fill={d} />
      <circle cx="28.5" cy="15" r="1" fill={d} />
      <path d="M24 17 L21.6 19.8 H26.4 Z" fill={d} />
      <path d="M12 24 C9 26 8 29 8.5 32 L12 30 Z M36 24 C39 26 40 29 39.5 32 L36 30 Z" fill={h} />
    </>
  ),
  elephant: ({ h, d, l }) => (
    <>
      <circle cx="12" cy="20" r="8" fill={h} />
      <circle cx="36" cy="20" r="8" fill={h} />
      <circle cx="12" cy="20" r="4.4" fill={l} />
      <circle cx="36" cy="20" r="4.4" fill={l} />
      <path d="M12 22 C12 14.8 17.4 10 24 10 C30.6 10 36 14.8 36 22 C36 28 32 32 27.5 33 V38 C27.5 41 24.5 42 22.8 40 L20.5 37 C17 35.5 12 30 12 22 Z" fill={h} />
      <circle cx="19" cy="21" r="2" fill={d} />
      <circle cx="29" cy="21" r="2" fill={d} />
      <path d="M21.5 27 H26.5 V36.5 C26.5 39.6 21.5 39.6 21.5 36.5 Z" fill={h} />
      <path d="M21.5 27 H26.5 V29 H21.5 Z" fill={d} opacity="0.2" />
    </>
  ),
  hedgehog: ({ h, d, l }) => (
    <>
      <path d="M24 6 L28 13 L34 9 L35 17 L43 16 L39 23 L45 27 L37 30 L40 38 L31 36 L24 42 L17 36 L8 38 L11 30 L3 27 L9 23 L5 16 L13 17 L14 9 L20 13 Z" fill={d} />
      <circle cx="24" cy="27" r="11" fill={h} />
      <circle cx="20" cy="25" r="2" fill={d} />
      <circle cx="28" cy="25" r="2" fill={d} />
      <ellipse cx="24" cy="31" rx="2.6" ry="2" fill={d} />
      <path d="M24 27 C22 27 21 28 21 29" stroke={l} strokeWidth="0" />
    </>
  ),
  leopard: ({ h, d, l }) => (
    <>
      <circle cx="13" cy="13" r="6" fill={h} />
      <circle cx="35" cy="13" r="6" fill={h} />
      <circle cx="13" cy="13" r="2.6" fill={d} />
      <circle cx="35" cy="13" r="2.6" fill={d} />
      <circle cx="24" cy="26" r="14" fill={h} />
      <circle cx="15" cy="22" r="1.8" fill={d} />
      <circle cx="33" cy="22" r="1.8" fill={d} />
      <circle cx="14" cy="30" r="1.8" fill={d} />
      <circle cx="34" cy="30" r="1.8" fill={d} />
      <circle cx="24" cy="17.5" r="1.8" fill={d} />
      <circle cx="19.5" cy="25" r="2" fill={d} />
      <circle cx="28.5" cy="25" r="2" fill={d} />
      <path d="M24 29 L21.8 31.6 H26.2 Z" fill={d} />
      <path d="M24 31.6 V34 M24 34 C22 36 20 36 18.5 35 M24 34 C26 36 28 36 29.5 35" stroke={d} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="26" r="0" fill={l} />
    </>
  ),
  whale: ({ h, d, l }) => (
    <>
      <path d="M6 26 C6 18 13 13 22 13 C33 13 42 19 42 28 C42 33 38 37 32 37 H16 C10 37 6 32 6 26 Z" fill={h} />
      <path d="M6 26 C10 24 14 24 18 26 C15 29 10 29.5 6 28 Z" fill={l} opacity="0.0" />
      <path d="M10 31 C14 28.6 30 28.6 36 31 C33 34.4 14 34.4 10 31 Z" fill={l} />
      <circle cx="15" cy="23" r="2" fill={d} />
      <path d="M34 13 C34 9 36 6.5 38 5 C38 7 39 8.6 41 9.6 C39 10.6 37.5 12 37 14.5 Z" fill={h} />
    </>
  ),
};

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export function Avatar({
  token,
  size = 32,
  className = "",
  ring = true,
}: {
  /** The stored profiles.avatar_emoji value (an opaque token), or an AvatarId. */
  token: string | null | undefined;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const id =
    token && (token as AvatarId) in MARKS
      ? (token as AvatarId)
      : avatarIdFor(token);

  const hue = id ? HUES[id] : "var(--text-3)";
  const ink: Ink = {
    h: hue,
    d: `color-mix(in oklab, ${hue} 34%, var(--text))`,
    l: "var(--surface)",
  };

  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full ${
        ring ? "ring-1 ring-[var(--line)]" : ""
      } ${className}`}
      style={{
        width: size,
        height: size,
        background: `color-mix(in oklab, ${hue} 16%, var(--raised))`,
      }}
    >
      <svg
        viewBox="0 0 48 48"
        width={Math.round(size * 0.78)}
        height={Math.round(size * 0.78)}
        focusable="false"
      >
        {id ? (
          MARKS[id](ink)
        ) : (
          /* Unknown token: the anchor block glyph, never a broken image. */
          <>
            <rect x="10" y="10" width="12" height="12" rx="2.5" fill={ink.d} />
            <rect x="26" y="10" width="12" height="12" rx="2.5" fill={hue} />
            <rect x="10" y="26" width="12" height="12" rx="2.5" fill={hue} />
            <rect x="26" y="26" width="12" height="12" rx="2.5" fill={ink.d} />
          </>
        )}
      </svg>
    </span>
  );
}
