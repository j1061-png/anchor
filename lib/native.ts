// Native-shell bridges. Every call is a no-op on the plain web: the Capacitor
// global only exists inside the iOS/Android app, so the site never breaks.

type HapticsPlugin = {
  notification: (opts: { type: "SUCCESS" | "WARNING" | "ERROR" }) => Promise<void>;
  impact: (opts: { style: "HEAVY" | "MEDIUM" | "LIGHT" }) => Promise<void>;
};

function haptics(): HapticsPlugin | null {
  if (typeof window === "undefined") return null;
  const cap = (window as unknown as { Capacitor?: { Plugins?: { Haptics?: HapticsPlugin } } })
    .Capacitor;
  return cap?.Plugins?.Haptics ?? null;
}

/** A solved item / finished session. */
export function hapticSuccess() {
  haptics()?.notification({ type: "SUCCESS" }).catch(() => {});
}

/** A wrong attempt — soft tap, never punishing. */
export function hapticTap() {
  haptics()?.impact({ style: "LIGHT" }).catch(() => {});
}
