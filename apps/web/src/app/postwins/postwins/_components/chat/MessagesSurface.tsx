"use client";

import React from "react";
import { useShallow } from "zustand/react/shallow"; // Stabilizes the array reference
import { Activity, ExternalLink, ArrowRight } from "lucide-react";
import { usePostWinStore } from "./store/usePostWinStore";
import { handleNavigation } from "@/utils/navigation";
import type { BackendMessage } from "@/lib/api/contracts/domain/message";
import type { CaseTimelineEvent } from "./store/postwins/slices/caseTimeline.slice";

type FeedItem =
  | { kind: "chat"; timestamp: string; data: BackendMessage }
  | { kind: "timeline"; timestamp: string; data: CaseTimelineEvent };

export function MessagesSurface() {
  /**
   * FIX: getUnifiedFeed() likely generates a new array reference on every call.
   * Wrapping it in useShallow ensures React 19/Zustand 5 doesn't trigger
   * an infinite loop by caching the snapshot result.
   */
  const feed = usePostWinStore(useShallow((s) => s.getUnifiedFeed()));
  const currentUserId = usePostWinStore((s) => (s as any).currentUserId);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [feed.length]);

  return (
    <div className="h-full w-full rounded-[var(--xotic-radius)] border border-line/50 bg-paper overflow-hidden flex flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-none p-4"
      >
        <div className="mx-auto w-full max-w-3xl space-y-6">
          {feed.length === 0 ? (
            <EmptyState />
          ) : (
            feed.map((item, i) => {
              if (item.kind === "chat") {
                return (
                  <MessageRow
                    key={`chat-${item.data.id}-${i}`}
                    msg={item.data}
                    isOwn={item.data.authorId === currentUserId}
                  />
                );
              }

              return <TimelineCard key={`timeline-${i}`} event={item.data} />;
            })
          )}
        </div>
      </div>
      <div className="h-3 border-t border-line/50 bg-surface-strong" />
    </div>
  );
}

/* =========================================================
   Chat Message Bubble
========================================================= */

function MessageRow({ msg, isOwn }: { msg: BackendMessage; isOwn: boolean }) {
  const safeType =
    typeof msg.type === "string" && msg.type.length > 0 ? msg.type : "SYSTEM";

  const safeBody =
    typeof msg.body === "string" && msg.body.length > 0 ? msg.body : "";

  const safeCreatedAt =
    msg.createdAt && !isNaN(new Date(msg.createdAt).getTime())
      ? new Date(msg.createdAt)
      : new Date();

  const navigationContext = msg.navigationContext ?? null;

  const isSignal = [
    "VERIFICATION_REQUEST",
    "COUNTER_CLAIM",
    "EVIDENCE_SUBMISSION",
    "FOLLOW_UP",
  ].includes(safeType);

  return (
    <div
      className={`group flex flex-col ${
        isOwn ? "items-end" : "items-start"
      } mb-4`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1 px-1">
        {safeType.replace("_", " ")}
      </span>

      <div
        id={msg.id}
        className={`
          relative max-w-[85%] rounded-[var(--xotic-radius)] border px-4 py-3 text-sm shadow-sm transition-all
          ${isOwn ? "bg-surface-strong border-line" : "bg-surface border-line/50"}
          ${isSignal ? "border-ocean/30 bg-ocean/5 ring-1 ring-ocean/10" : ""}
        `}
      >
        <p className="leading-relaxed text-ink/90 whitespace-pre-wrap">
          {safeBody}
        </p>

        {navigationContext && (
          <button
            onClick={() => handleNavigation(navigationContext)}
            className="mt-3 flex w-full items-center justify-between gap-2 rounded-md bg-ocean/10 px-3 py-2 text-xs font-semibold text-ocean hover:bg-ocean/20 transition-colors border border-ocean/20"
          >
            <span className="truncate">
              {navigationContext.label ||
                `View ${navigationContext.target ?? "Details"}`}
            </span>

            {navigationContext.target === "EXTERNAL" ? (
              <ExternalLink className="h-3 w-3 shrink-0" />
            ) : (
              <ArrowRight className="h-3 w-3 shrink-0" />
            )}
          </button>
        )}
      </div>

      <span className="text-[9px] text-ink/30 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {safeCreatedAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}

/* =========================================================
   Timeline Card (System Projection)
========================================================= */

function TimelineCard({ event }: { event: CaseTimelineEvent }) {
  const timestamp =
    event.type === "gap"
      ? event.scheduledFor
      : event.type === "window"
        ? event.openedAt
        : event.occurredAt;

  return (
    <div className="flex justify-center my-4">
      <div className="w-full max-w-md rounded-xl border border-ocean/20 bg-ocean/5 px-4 py-3 text-xs text-ocean shadow-sm">
        <div className="font-semibold uppercase tracking-wider mb-1">
          {event.type.replace("_", " ")}
        </div>

        <div className="text-ink/80 text-sm">
          {renderTimelineContent(event)}
        </div>

        <div className="mt-2 text-[10px] text-ink/40">
          {new Date(timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function renderTimelineContent(event: CaseTimelineEvent) {
  switch (event.type) {
    case "delivery":
      return event.summary;

    case "followup":
      return `Follow-up • ${event.kind}`;

    case "gap":
      return `${event.label} • ${
        event.status === "missing" ? "Missing" : "Upcoming"
      }`;

    case "window":
      return `Window ${event.status} • closes ${new Date(
        event.closesAt,
      ).toLocaleDateString()}`;

    default:
      return "";
  }
}

/* =========================================================
   Empty State
========================================================= */

function EmptyState() {
  return (
    <div className="flex justify-center py-10">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-line/50 bg-surface-strong text-xs text-ink/60 font-medium">
        <Activity className="h-4 w-4 text-ocean animate-pulse" />
        Waiting for activity...
      </div>
    </div>
  );
}
