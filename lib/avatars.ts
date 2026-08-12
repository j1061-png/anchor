export interface AvatarDef {
  id: string;
  label: string;
  color: string;
}

/** Stored in profiles.avatar_emoji — plain id, not unicode emoji. */
export const AVATARS: AvatarDef[] = [
  { id: "compass", label: "Compass", color: "#3B82F6" },
  { id: "spark", label: "Spark", color: "#F59E0B" },
  { id: "wave", label: "Wave", color: "#06B6D4" },
  { id: "peak", label: "Peak", color: "#8B5CF6" },
  { id: "orbit", label: "Orbit", color: "#EC4899" },
  { id: "pulse", label: "Pulse", color: "#EF4444" },
  { id: "node", label: "Node", color: "#10B981" },
  { id: "arc", label: "Arc", color: "#6366F1" },
  { id: "prism", label: "Prism", color: "#14B8A6" },
  { id: "vertex", label: "Vertex", color: "#F97316" },
  { id: "bolt", label: "Bolt", color: "#EAB308" },
  { id: "anchor", label: "Anchor", color: "#1A365D" },
];

export function isAvatarId(value: string | null | undefined): value is string {
  if (!value) return false;
  return AVATARS.some((a) => a.id === value);
}

export function avatarDef(id: string | null | undefined): AvatarDef | null {
  if (!id) return null;
  return AVATARS.find((a) => a.id === id) ?? null;
}
