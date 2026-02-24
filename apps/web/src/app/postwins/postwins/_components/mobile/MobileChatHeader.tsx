import Link from "next/link";
import { ArrowLeft, Info, MoreVertical } from "lucide-react";

type Props = {
  // Tablet drawer toggle
  onToggleDetails?: () => void;
  detailsOpen?: boolean;

  // Mobile full-screen details route
  detailsHref?: string;
};

export function MobileChatHeader({
  onToggleDetails,
  detailsOpen,
  detailsHref,
}: Props) {
  const showToggle = typeof onToggleDetails === "function";
  const showLink = !showToggle && typeof detailsHref === "string";

  return (
    <header
      aria-label="Mobile chat header"
      className="
        h-[var(--xotic-topbar-h)] flex-shrink-0
        bg-paper
        border-b border-line/50
        px-4
        flex items-center gap-3
      "
    >
      {/* back */}
      <button
        type="button"
        aria-label="Back"
        className="
          h-9 w-9 rounded-lg
          bg-surface-muted
          border border-line/50
          flex items-center justify-center
          text-ink
          focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
        "
      >
        <ArrowLeft size={16} aria-hidden="true" />
      </button>

      {/* avatar */}
      <div
        className="
          h-9 w-9 rounded-full
          bg-surface-muted
          border border-line/50
          flex-shrink-0
        "
      />

      {/* title (skeleton — intentional) */}
      <div className="flex-1 min-w-0">
        <div className="h-3.5 w-32 max-w-[60%] rounded bg-surface-muted border border-line/40" />
        <div className="mt-2 h-3 w-20 max-w-[40%] rounded bg-surface-muted border border-line/40" />
      </div>

      {/* actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Info"
          className="
            h-9 w-9 rounded-lg
            bg-surface-muted
            border border-line/50
            flex items-center justify-center
            text-ink
            focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
          "
        >
          <Info size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="More actions"
          className="
            h-9 w-9 rounded-lg
            bg-surface-muted
            border border-line/50
            flex items-center justify-center
            text-ink
            focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
          "
        >
          <MoreVertical size={16} aria-hidden="true" />
        </button>

        {/* details action: tablet toggle OR mobile link OR plain box */}
        {showToggle ? (
          <button
            type="button"
            onClick={onToggleDetails}
            aria-label={detailsOpen ? "Close details" : "Open details"}
            className="
              h-9 w-9 rounded-lg
              bg-surface-muted
              border border-line/50
              flex items-center justify-center
              text-ink
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            <Info size={16} aria-hidden="true" />
          </button>
        ) : showLink ? (
          <Link
            href={detailsHref!}
            aria-label="Open details (full screen)"
            className="
              h-9 w-9 rounded-lg
              bg-surface-muted
              border border-line/50
              flex items-center justify-center
              text-ink
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            <Info size={16} aria-hidden="true" />
          </Link>
        ) : (
          <div className="h-9 w-9 rounded-lg bg-surface-muted border border-line/50" />
        )}
      </div>
    </header>
  );
}
