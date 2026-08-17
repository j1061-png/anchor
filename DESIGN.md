# Anchor design system

The rules every screen follows. If a page disagrees with this file, the page is
wrong.

## Principles

1. **The research is the product.** Every mechanic that could read as arbitrary
   gamification carries a `<WhyThis k="..." />` explaining what it is for, with
   a citation. The registry lives in `lib/why.ts` — add a key there rather than
   writing prose into a page.
2. **Say what a number does not mean.** Stats carry an honest `hint`. Anchor
   never shows a metric that implies more than it measures.
3. **Effort over output.** Copy and visuals lead with unaided work, recall days
   and brain-only sessions — never a raw score.
4. **Nothing unexplained.** A student who has never opened the app should be
   able to tell what a screen is for, why it exists, and what to do next
   without instructions.

## Tokens

All tokens are CSS variables in `app/globals.css`, exposed to Tailwind through
`@theme inline`. There is no `tailwind.config.*`.

| Role | Class | Notes |
|---|---|---|
| Page background | `bg-canvas` | Soft brand-tinted gradient, fixed |
| Card | `bg-surface` / `.card` | 1px `--line`, `--r-lg`, `--shadow-sm` |
| Inset panel | `bg-raised` / `.well` | Secondary detail inside a card |
| Track / empty | `bg-sunken` | Progress tracks, empty cells |
| Text | `text-text` → `text-text-2` → `text-text-3` | Three levels, in that order |
| Hairline | `border-[var(--line)]` | `--line-strong` for emphasis |
| Brand | `text-brand` / `bg-brand` | Crimson. One loud colour, used sparingly |
| Data series | `--cobalt`, `--green`, `--amber`, `--gold` | Never for UI chrome |

Radii: `--r-xs` 6 · `--r-sm` 10 · `--r-md` 14 · `--r-lg` 20 · `--r-xl` 28.
Depth: `--shadow-xs/sm/md/lg`. Motion: `--ease-out`, `--t-fast/base/slow`.

**Dark mode is real.** Every colour has a `.dark` value. Never hard-code a hex
in a component; use the variables so both themes work.

## Type

- `.t-hero` page-opening statement · `.t-title` page title · `.t-section`
  card/section heading · `.t-eyebrow` small caps label
- All numerals use `.num` (Martian Mono, tabular).
- Body copy sits at `text-sm`/`text-[0.9375rem]` with `leading-relaxed`;
  `text-text-2` for anything explanatory.

## Layout

The shell (`app/(app)/layout.tsx`) owns gutters and mobile tab-bar clearance
only. Each page sets its own width:

```tsx
<Page width="wide">      {/* 1152px — dashboards, card grids (default) */}
<Page width="full">      {/* 1408px — timelines, boards */}
<Page width="focused">   {/* 768px — one task at a time: a puzzle, a form */}
<Page width="read">      {/* 68ch — long prose */}
```

Never re-introduce an app-wide fixed column: the old `max-w-2xl` shell is what
made every screen feel cramped.

Use `<PageHeader eyebrow title lead action />` at the top of every page and
`<Section title description>` to group cards. Grids go
`grid gap-4 sm:grid-cols-2 lg:grid-cols-3` — content should use the width it is
given.

## Navigation

Five tabs, defined once in `components/nav.tsx`:
**Today · Learn · Review · Progress · Profile**.

Sub-pages belong to a tab and appear as a `<SegmentedNav>` *inside* that
section — never as a second global strip. A tab highlights for any route it
`owns`, so a session or a sub-page never leaves the nav looking unselected.

## Components

`components/ui/`: `Button` (primary/brand/secondary/ghost/danger × sm/md/lg,
`loading`, `full`) · `Card` + `CardHeader/Title/Description/Footer` + `Well` ·
`Badge` · `Icon` (one stroke set — no emoji in chrome) · `Stat` + `StatGrid` ·
`ProgressBar` / `ProgressRing` · `SegmentedNav` · `Skeleton` · `ThemeToggle` ·
`WhyThis` / `WhyNote` · `Page` / `PageHeader` / `Section`.

Add to this kit rather than writing bespoke card markup in a page.

## Motion

`.rise-in`, `.deal-in`, `.fade-in`, `.pop-in`, and `.stagger` (set `--i` on
children) for entrances. `.card-hover` for interactive cards. Everything is
disabled under `prefers-reduced-motion`.

## Accessibility

WCAG AA contrast in both themes. Real focus rings (`:focus-visible` is global).
Hit targets ≥44px. `aria-current` on nav links. Skip link in the shell.
Never rely on `title=` alone for information on touch.
