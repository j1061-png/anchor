import type { Segment } from "@/components/ui/segmented";

/**
 * The Review section's sub-navigation. Defined once so /review and /journal
 * show the same set — both are ways of bringing back something you already
 * met, so they belong to the same tab rather than floating separately.
 */
export const REVIEW_TABS: Segment[] = [
  { href: "/review", label: "Due", icon: "review" },
  { href: "/journal", label: "Error journal", icon: "journal" },
];
