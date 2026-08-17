// The Anchor mark: an anchor whose crown is a small padlock — hold on to what
// you know, keep it locked in. Drawn here once and echoed (in fixed colours)
// by the share-card route. The anchor takes the text colour; the keyhole is
// the one loud colour, same role the red block played in the old motif.

export function AnchorMark({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* Shackle */}
      <path
        d="M9.4 7.2V5.6a2.6 2.6 0 0 1 5.2 0v1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Lock body as the anchor's crown */}
      <rect x="7.4" y="7.2" width="9.2" height="5.2" rx="1.7" fill="currentColor" />
      {/* Keyhole */}
      <circle cx="12" cy="9.8" r="1.2" fill="var(--flag)" />
      {/* Shank */}
      <path
        d="M12 12.4v9.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Flukes with upturned tips */}
      <path
        d="M4.8 15.2a7.2 7.2 0 0 0 14.4 0M4.8 15.4v-2.8M19.2 15.4v-2.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <AnchorMark className="text-ink" />
      <span className="font-display text-xl font-extrabold tracking-tight">
        anchor
      </span>
    </span>
  );
}
