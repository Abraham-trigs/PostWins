"use client";

import { Activity, ChevronRight, Info, MoreHorizontal } from "lucide-react";
import { usePostWinStore } from "../../store/usePostWinStore";
import { ProgressLoader } from "./ProgressLoader";
import { cn } from "../../../../../../utils/utils";

export function ChatHeader() {
  const caseId = usePostWinStore((s) => s.activeCaseId);
  const isDraft = caseId?.startsWith("draft_");

  return (
    <header
      aria-label="Chat header"
      className="
        h-[var(--xotic-topbar-h)] flex-shrink-0
        border-b border-line/50
        bg-paper
        px-[var(--xotic-pad-6)]
        flex items-center justify-between
        z-40 relative
      "
    >
      {/* 🚀 THE TELEPORTED LOADER: Injected but decoupled */}
      <ProgressLoader />

      {/* Left: Title + Metadata */}
      <div className="min-w-0 flex items-center gap-4">
        <div className="flex flex-col min-w-0">
          <h1 className="truncate text-sm font-bold tracking-tight text-ink">
            {isDraft ? "New Project Intake" : "Project Activity"}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink/70">
            <span className="truncate">Timeline</span>
            <ChevronRight
              className="h-3.5 w-3.5 text-ink/35"
              aria-hidden="true"
            />
            <span className="truncate">Delivery</span>
            <ChevronRight
              className="h-3.5 w-3.5 text-ink/35"
              aria-hidden="true"
            />
            <span className="truncate">Follow-ups</span>
          </div>
        </div>

        {/* Status Pill: Shifts theme if drafting */}
        <div
          className={cn(
            "inline-flex items-center gap-2 h-6 px-2.5 rounded-pill border transition-colors",
            isDraft
              ? "bg-amber-50 border-amber-200 text-amber-600"
              : "bg-surface-strong border-line/50 text-ink/75",
          )}
          aria-label={isDraft ? "Status: Drafting" : "Status: Active"}
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-25",
                isDraft ? "bg-amber-500" : "bg-[var(--state-success)]",
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isDraft ? "bg-amber-500" : "bg-[var(--state-success)]",
              )}
            />
          </span>

          {!isDraft && (
            <Activity
              className="h-3.5 w-3.5 text-[var(--state-success)]"
              aria-hidden="true"
            />
          )}

          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              isDraft ? "text-amber-600" : "text-[var(--state-success)]",
            )}
          >
            {isDraft ? "Drafting" : "Active"}
          </span>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="
            h-9 px-4
            flex items-center gap-2
            rounded-lg
            border border-line/50
            bg-surface-strong
            text-xs font-semibold text-ink
            hover:bg-surface-muted
            focus:outline-none
            focus-visible:ring-2 focus-visible:ring-ring
            transition
            active:scale-95
          "
        >
          <Info size={14} className="text-ocean" aria-hidden="true" />
          <span>Details</span>
        </button>

        <button
          type="button"
          className="
            h-9 w-9
            flex items-center justify-center
            rounded-lg
            border border-line/50
            bg-surface-strong
            text-ink
            hover:bg-surface-muted
            focus:outline-none
            focus-visible:ring-2 focus-visible:ring-ring
            transition
            active:scale-95
          "
          aria-label="More actions"
        >
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
