// src/app/xotic/postwins/_components/chat/MessagesSurface.tsx
// Purpose: Unified feed container delegating to ChatBubble, TimelineBubble, QuestionnaireBubble,
// and CaseBootstrapBubble for case initialization events.

/* =============================================================================
Assumptions
------------------------------------------------------------------------------
• ThreadMessage.metadata may contain { systemEvent: "CASE_BOOTSTRAP", referenceCode }
• Backend inserts a message:
      type: "SYSTEM_EVENT"
      metadata.systemEvent: "CASE_BOOTSTRAP"
• CaseBootstrapBubble exists at ./bubbles/CaseBootstrapBubble
=============================================================================*/

/* =============================================================================
Design reasoning       pnpm turbo run --filter=@posta/backend build 
------------------------------------------------------------------------------
MessagesSurface acts as the orchestration layer of the chat feed. It merges
conversation messages, governance timeline events, and intake UI components
into a unified render stream.

Rather than overloading ChatBubble with lifecycle awareness, CASE_BOOTSTRAP
events are intercepted here and routed to CaseBootstrapBubble. This keeps
ChatBubble focused purely on conversational rendering while system lifecycle
events remain visually distinct.

QuestionnaireBubble remains a temporary UI injector controlled by composerMode.
=============================================================================*/
"use client";

import React, { useMemo, useCallback, useRef, useState } from "react";
import { Activity, ArrowDown } from "lucide-react";
import { usePostWinStore } from "../../store/usePostWinStore";
import type { ThreadMessage } from "../../store/types";
import type { CaseTimelineEvent } from "../../store/slices/caseTimeline.slice";

import { ChatBubble } from "./ChatBubble";
import { TimelineBubble } from "@ui/chat/UI/common/TimelineBubble";
import { QuestionnaireBubble } from "../../questionaire/QuestionnaireBubble";
import { CaseBootstrapBubble } from "./CaseBootstrapBubble";
import { ViewToggle } from "./ViewToggle";

// 🚀 NAVIGATION & HOOKS
import { handleNavigation } from "@/utils/navigation";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { usePrependScrollRestore } from "../../hooks/usePrependScrollRestore";
import { useSmartAutoScroll } from "../../hooks/useSmartAutoScroll";

/* =========================================================
Feed Types
========================================================= */

type UnifiedFeedItem =
  | { kind: "chat"; timestamp: string; data: ThreadMessage }
  | { kind: "timeline"; timestamp: string; data: CaseTimelineEvent }
  | { kind: "questionnaire"; timestamp: string }
  | { kind: "date_divider"; timestamp: string; dateLabel: string }; // 📅 New Type

/* =========================================================
Component
========================================================= */

export function MessagesSurface() {
  const getUnifiedFeed = usePostWinStore((s) => s.getUnifiedFeed);
  const currentUserId = usePostWinStore((s) => s.currentUserId);
  const composerMode = usePostWinStore((s) => s.composerMode);
  const caseId = usePostWinStore((s) => s.activeCaseId);
  const setActiveView = usePostWinStore((s) => s.setActiveView);

  const fetchMoreMessages = usePostWinStore((s) => s.fetchMoreMessages);
  const hasMore = usePostWinStore((s) => s.hasMore);
  const isFetchingMore = usePostWinStore((s) => s.isFetchingMore);

  /* ================= 1. Scroll & Pagination Intelligence ================= */

  const { containerRef, captureHeight, restoreScroll } =
    usePrependScrollRestore() as {
      containerRef: React.RefObject<HTMLDivElement | null>;
      captureHeight: () => void;
      restoreScroll: () => void;
    };

  const [showScrollAnchor, setShowScrollAnchor] = useState(false);

  /* ================= 2. Feed Processing (Unified + Dates) ================= */

  const feedWithDates = useMemo(() => {
    const raw = getUnifiedFeed();
    const isDraft = caseId?.startsWith("draft_");

    const processed: UnifiedFeedItem[] = [];
    let lastDateLabel = "";

    raw.forEach((item) => {
      const date = new Date(item.timestamp);
      const dateLabel = date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      // Inject Date Divider if day changed
      if (dateLabel !== lastDateLabel) {
        processed.push({
          kind: "date_divider",
          timestamp: item.timestamp,
          dateLabel: dateLabel,
        });
        lastDateLabel = dateLabel;
      }
      processed.push(item as UnifiedFeedItem);
    });

    if (composerMode === "record" && isDraft) {
      processed.push({
        kind: "questionnaire",
        timestamp: new Date().toISOString(),
      });
    }

    return processed;
  }, [getUnifiedFeed, composerMode, caseId]);

  useSmartAutoScroll({
    containerRef,
    dependency: feedWithDates.length,
    threshold: 120,
  });

  const { sentinelRef } = useInfiniteScroll({
    enabled: hasMore && !isFetchingMore && !caseId?.startsWith("draft_"),
    onLoadMore: async () => {
      if (!caseId) return;
      captureHeight();
      await fetchMoreMessages(caseId);
      restoreScroll();
    },
    root: containerRef.current,
  });

  /* ================= Smart Navigation Switcher ================= */
  const onJumpToMessage = useCallback(
    (targetId: string) => {
      const element = document.getElementById(targetId);
      if (!element) {
        setActiveView("all");
        setTimeout(() => {
          handleNavigation({
            target: "MESSAGE",
            id: targetId,
            params: { highlight: true, focus: true, mode: "peek" },
          });
        }, 60);
        return;
      }
      handleNavigation({
        target: "MESSAGE",
        id: targetId,
        params: { highlight: true, focus: true, mode: "peek" },
      });
    },
    [setActiveView],
  );

  const isDraftMode = caseId?.startsWith("draft_");

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    setShowScrollAnchor(!isNearBottom);
  };

  return (
    <div className="h-full w-full rounded-[var(--xotic-radius)] border border-line/50 bg-paper overflow-hidden flex flex-col relative group">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-none p-4"
      >
        <div className="mx-auto w-full max-w-3xl">
          {!isDraftMode && <ViewToggle />}

          <div className="relative space-y-8 pb-10">
            <div ref={sentinelRef} className="h-1 w-full" />

            {!isDraftMode && feedWithDates.length > 0 && (
              <div className="absolute left-1/2 top-16 bottom-0 w-px bg-gradient-to-b from-line via-line/40 to-transparent -translate-x-1/2 hidden md:block" />
            )}

            {feedWithDates.length === 0 ? (
              <EmptyState />
            ) : (
              feedWithDates.map((item, i) => (
                <div key={i} className="relative z-10">
                  {/* 📅 Date Divider Rendering */}
                  {item.kind === "date_divider" && (
                    <div className="sticky top-0 z-20 py-4 flex justify-center">
                      <span className="px-4 py-1 bg-surface-strong/80 backdrop-blur-sm border border-line/40 rounded-full text-[10px] font-bold uppercase tracking-widest text-ink/60 shadow-sm">
                        {item.dateLabel}
                      </span>
                    </div>
                  )}

                  {item.kind === "chat" &&
                    (() => {
                      const meta = item.data.metadata as any;
                      if (
                        item.data.type === "SYSTEM_EVENT" &&
                        meta?.systemEvent === "CASE_BOOTSTRAP"
                      ) {
                        return <CaseBootstrapBubble message={item.data} />;
                      }
                      return (
                        <ChatBubble
                          message={item.data}
                          isOwn={item.data.authorId === currentUserId}
                        />
                      );
                    })()}

                  {item.kind === "timeline" && (
                    <div className="flex justify-center my-4">
                      <TimelineBubble event={item.data} />
                    </div>
                  )}

                  {item.kind === "questionnaire" && (
                    <div className="flex justify-center">
                      <QuestionnaireBubble />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showScrollAnchor && !isDraftMode && (
        <button
          onClick={() => {
            if (containerRef.current) {
              containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: "smooth",
              });
            }
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-ink text-paper rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-4 z-50 border border-line/20"
        >
          <ArrowDown size={12} className="animate-bounce" />
          Recent Activity
        </button>
      )}

      <div className="h-3 border-t border-line/50 bg-surface-strong" />
    </div>
  );
}

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

/* =============================================================================
Structure
------------------------------------------------------------------------------
MessagesSurface
  • Retrieves unified feed from store
  • Injects QuestionnaireBubble during intake mode
  • Routes feed items:
        SYSTEM_EVENT → CaseBootstrapBubble
        chat message → ChatBubble
        timeline event → TimelineBubble
=============================================================================*/

/* =============================================================================
Implementation guidance
------------------------------------------------------------------------------
Backend must insert a bootstrap message with:

type: "SYSTEM_EVENT"

metadata: {
  systemEvent: "CASE_BOOTSTRAP",
  referenceCode: string
}

Once present in the message feed, this component automatically renders the
CaseBootstrapBubble.
=============================================================================*/

/* =============================================================================
Scalability insight
------------------------------------------------------------------------------
Future lifecycle events can be handled here using the same pattern:

CASE_ROUTED
VERIFICATION_STARTED
EXECUTION_STARTED
CASE_CLOSED

Each event maps to its own UI bubble without modifying ChatBubble.
=============================================================================*/
