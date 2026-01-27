import Link from "next/link";

type Props = {
  href?: string;
  compact?: boolean;
};

export function MobileChatRow({ href, compact }: Props) {
  const Row = (
    <div
      className={[
        "w-full flex items-center gap-3",
        "px-[var(--xotic-pad-4)]",
        compact ? "py-[var(--xotic-pad-2)]" : "py-[var(--xotic-pad-3)]",
      ].join(" ")}
    >
      {/* avatar */}
      <div className="h-12 w-12 rounded-full bg-surface-muted border border-line flex-shrink-0" />

      {/* text blocks */}
      <div className="min-w-0 flex-1">
        <div className="h-4 w-40 max-w-[70%] rounded bg-surface-muted border border-line" />
        <div className="mt-2 h-3 w-56 max-w-[85%] rounded bg-surface-muted border border-line" />
      </div>

      {/* time / badge */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="h-3 w-10 rounded bg-surface-muted border border-line" />
        <div className="h-5 w-5 rounded-full bg-surface-muted border border-line" />
      </div>
    </div>
  );

  if (!href) return Row;

  return (
    <Link
      href={href}
      aria-label="Open chat"
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {Row}
    </Link>
  );
}
