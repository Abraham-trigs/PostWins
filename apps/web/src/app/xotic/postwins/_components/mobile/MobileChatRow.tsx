import Link from "next/link";
import type { CaseListItem } from "@/lib/api/cases.api";

type Props = {
  caseItem: CaseListItem;
  href?: string;
  compact?: boolean;
};

export function MobileChatRow({ caseItem, href, compact }: Props) {
  const { id, lifecycle, summary, createdAt, lastMessage } = caseItem;

  const preview =
    lastMessage?.body ??
    (lastMessage ? `[${lastMessage.type}]` : (summary ?? "No activity yet"));

  const timeLabel = new Date(
    lastMessage?.createdAt ?? createdAt,
  ).toLocaleDateString();

  const Row = (
    <div
      className={[
        "w-full flex items-center gap-3",
        "px-[var(--xotic-pad-4)]",
        compact ? "py-[var(--xotic-pad-2)]" : "py-[var(--xotic-pad-3)]",
      ].join(" ")}
    >
      {/* avatar placeholder */}
      <div className="h-12 w-12 rounded-full bg-surface-muted border border-line flex-shrink-0" />

      {/* text */}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink truncate">
          Case {id.slice(0, 6)} • {lifecycle}
        </div>

        <div className="mt-1 text-xs text-ink/70 truncate">{preview}</div>
      </div>

      {/* time */}
      <div className="flex flex-col items-end flex-shrink-0 text-xs text-ink/60">
        <span>{timeLabel}</span>
      </div>
    </div>
  );

  if (!href) return Row;

  return (
    <Link
      href={href}
      aria-label={`Open case ${id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {Row}
    </Link>
  );
}
