import type { ReactElement, SVGProps } from "react";

/* One stroke-based icon set at a single weight. Replaces the emoji and the
   one-off per-surface SVGs that made the old nav feel inconsistent. */

export type IconName =
  | "today"
  | "learn"
  | "review"
  | "progress"
  | "profile"
  | "practice"
  | "brainOnly"
  | "journal"
  | "board"
  | "evidence"
  | "flame"
  | "trophy"
  | "target"
  | "spark"
  | "lock"
  | "check"
  | "close"
  | "chevronRight"
  | "chevronDown"
  | "arrowRight"
  | "arrowUpRight"
  | "share"
  | "copy"
  | "link"
  | "info"
  | "settings"
  | "sun"
  | "moon"
  | "clock"
  | "plus"
  | "minus"
  | "users"
  | "download"
  | "rotate"
  | "menu";

const paths: Record<IconName, ReactElement> = {
  today: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      <path d="M8.5 14.5h3.5" />
    </>
  ),
  learn: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5h-5A1.5 1.5 0 0 1 4 15V5.5Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5h5A1.5 1.5 0 0 0 20 15V5.5Z" />
    </>
  ),
  review: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3.5 4.5v4h4" />
      <path d="M12 8v4.4l2.8 1.7" />
    </>
  ),
  progress: (
    <>
      <path d="M4 19.5V15M9.3 19.5v-8M14.7 19.5V7M20 19.5V4.5" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  practice: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
      <path d="M17 14v6M14 17h6" />
    </>
  ),
  brainOnly: (
    <>
      <path d="M9 4.2A3.2 3.2 0 0 0 5.8 7.4 3 3 0 0 0 4 10.2c0 1 .5 2 1.3 2.5a3 3 0 0 0 .6 3.6A3.1 3.1 0 0 0 9.4 20 2.6 2.6 0 0 0 12 17.4V6.8A2.6 2.6 0 0 0 9.4 4.2Z" />
      <path d="M15 4.2a3.2 3.2 0 0 1 3.2 3.2 3 3 0 0 1 1.8 2.8c0 1-.5 2-1.3 2.5a3 3 0 0 1-.6 3.6A3.1 3.1 0 0 1 14.6 20 2.6 2.6 0 0 1 12 17.4" />
    </>
  ),
  journal: (
    <>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19.5v-15Z" />
      <path d="M5 17.5h14" />
      <path d="M9 7.5h6M9 11h4" />
    </>
  ),
  board: (
    <>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M6.5 4h11v4.5a5.5 5.5 0 1 1-11 0V4Z" />
      <path d="M6.5 6H4.2a2.3 2.3 0 0 0 2.3 4.6M17.5 6h2.3a2.3 2.3 0 0 1-2.3 4.6" />
    </>
  ),
  evidence: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
      <path d="M8.6 11.2l1.7 1.7 3.2-3.6" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3s5 4 5 8.6a5 5 0 0 1-10 0C7 9 9.5 7.2 9.5 7.2S9 9.4 10.4 10c1.4.7 1.6-2.2 1.6-7Z" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17.5V21" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5a2.5 2.5 0 0 0 2.5 5M17 6h2.5a2.5 2.5 0 0 1-2.5 5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3.5l1.9 4.9 4.9 1.9-4.9 1.9L12 17.1l-1.9-4.9-4.9-1.9 4.9-1.9L12 3.5Z" />
      <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.6" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5 10-11" />,
  close: <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  chevronDown: <path d="M5 9l7 7 7-7" />,
  arrowRight: <path d="M4 12h15m-6-6.5L19.5 12 13 18.5" />,
  arrowUpRight: <path d="M7 17L17 7m0 0H8m9 0v9" />,
  share: (
    <>
      <path d="M12 15.5V3.5m0 0L8 7.5m4-4 4 4" />
      <path d="M5 13v5.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V13" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11.5" height="11.5" rx="2.6" />
      <path d="M15 6.2V5.5A2.5 2.5 0 0 0 12.5 3h-7A2.5 2.5 0 0 0 3 5.5v7A2.5 2.5 0 0 0 5.5 15h.7" />
    </>
  ),
  link: (
    <>
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7l-1.3 1.3" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 1 0 5.7 5.7l1.3-1.3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.9" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3.2a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3.2a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1.5Z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </>
  ),
  moon: <path d="M20 14.2A8.5 8.5 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.3l3.4 2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" />
      <path d="M16 5.2a3.4 3.4 0 0 1 0 5.6M17.5 14.4A6.2 6.2 0 0 1 21.2 20" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.5v11m0 0 4-4m-4 4-4-4" />
      <path d="M4.5 17v1.5A2.5 2.5 0 0 0 7 21h10a2.5 2.5 0 0 0 2.5-2.5V17" />
    </>
  ),
  rotate: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
      <path d="M20.5 4.5v4h-4" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number | string;
}

export function Icon({ name, size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={`shrink-0 ${className}`}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
