"use client";

import { useMemo } from "react";
import { X } from "lucide-react"; // Imported from lucide-react
import type { EvidenceFile } from "../store/types";

export function AttachmentChip({
  evidence,
  onRemove,
}: {
  evidence: EvidenceFile;
  onRemove: () => void;
}) {
  const label = useMemo(() => {
    const kind =
      evidence.kind === "image"
        ? "Image"
        : evidence.kind === "video"
        ? "Video"
        : evidence.kind === "audio"
        ? "Audio"
        : "Doc";
    return `${kind}: ${evidence.file.name}`;
  }, [evidence]);

  return (
    <div
      className={[
        "max-w-full inline-flex items-center gap-2",
        "rounded-full px-3 py-1 text-xs",
        "bg-surface-strong border border-line/50 text-ink",
      ].join(" ")}
      title={evidence.file.name}
    >
      <span className="inline-flex items-center rounded-full bg-ocean/30 px-2 py-0.5 text-[10px] font-semibold text-ink">
        {evidence.kind}
      </span>

      <span className="truncate max-w-[16rem] text-ink/85">{label}</span>

      <button
        type="button"
        aria-label={`Remove ${evidence.file.name}`}
        onClick={onRemove}
        className={[
          "h-5 w-5 rounded-full grid place-items-center",
          "border border-line/50",
          "text-ink/70 hover:text-ink hover:bg-surface",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-danger)]",
          "transition-colors",
        ].join(" ")}
      >
        {/* Replaced span with Lucide X icon */}
        <X size={12} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  );
}
