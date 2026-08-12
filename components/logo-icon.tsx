/** Anchor + padlock mark from the brand logo. */
export function LogoIcon({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 80"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="anchorLockBody" x1="32" y1="18" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BFDBFE" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <path
        d="M22 18V14a10 10 0 0 1 20 0v4"
        stroke="#12141A"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="18" y="18" width="28" height="26" rx="6" fill="url(#anchorLockBody)" />
      <circle cx="32" cy="29" r="3.5" fill="#12141A" />
      <path d="M32 32.5v6" stroke="#12141A" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 44v18" stroke="#12141A" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M18 58c4 4 8 6 14 6s10-2 14-6"
        stroke="#12141A"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M20 50h24" stroke="#12141A" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M18 62l6-8M46 62l-6-8"
        stroke="#12141A"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
