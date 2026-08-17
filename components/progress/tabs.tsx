import type { Segment } from "@/components/ui/segmented";

/**
 * The Progress section's sub-navigation. Defined once so every page under the
 * tab shows the same set — these used to be loose items in an app-wide strip
 * with labels that did not match their routes.
 */
export const PROGRESS_TABS: Segment[] = [
  { href: "/progress", label: "Timeline", icon: "progress" },
  { href: "/independence", label: "Independence", icon: "brainOnly" },
  { href: "/dashboard", label: "Skills", icon: "target" },
  { href: "/leaderboard", label: "Board", icon: "board" },
  { href: "/about-the-evidence", label: "Evidence", icon: "evidence" },
];
