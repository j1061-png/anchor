"use client";

/**
 * A compact share affordance for surfaces that are not primarily about
 * sharing — one unlocked achievement, the recall-days figure.
 *
 * Collapsed it is a single quiet button. Opened it reveals the real
 * <ShareButton>, so every surface gets the same Web Share / WhatsApp / X /
 * copy / save-image behaviour without repeating any of it.
 *
 * When the user has not opted in to public cards there is nothing to share —
 * rather than failing silently at the image route, this says so and points at
 * the setting.
 */

import { useId, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ShareButton } from "./share-button";

export interface ShareInlineProps {
  /** Accessible label, e.g. "Share the milestone 'century'". */
  label: string;
  title: string;
  text: string;
  url: string;
  imageUrl: string;
  friendCode?: string;
  optedIn: boolean;
  className?: string;
}

export function ShareInline({
  label,
  title,
  text,
  url,
  imageUrl,
  friendCode,
  optedIn,
  className = "",
}: ShareInlineProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[var(--r-sm)] px-2 text-xs font-semibold text-text-3 transition-colors hover:bg-raised hover:text-text"
      >
        <Icon name="share" size={14} />
        {open ? "Close" : "Share"}
      </button>

      {open && (
        <div
          id={id}
          className="fade-in mt-2 rounded-[var(--r-md)] border border-[var(--line)] bg-raised p-3"
        >
          {optedIn ? (
            <ShareButton
              title={title}
              text={text}
              url={url}
              imageUrl={imageUrl}
              friendCode={friendCode}
            />
          ) : (
            <p className="text-xs leading-relaxed text-text-2">
              Public share cards are off, so this card would not load for
              anyone you sent it to.{" "}
              <Link
                href="/profile#sharing"
                className="font-semibold text-text underline decoration-dotted underline-offset-4"
              >
                Turn public cards on
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
