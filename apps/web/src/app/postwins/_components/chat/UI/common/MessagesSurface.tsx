// src/app/xotic/postwins/_components/chat/MessagesSurface.tsx
// Purpose: Unified feed container delegating to ChatBubble, TimelineBubble and Intake bubbles.

"use client";

import React, { useMemo } from "react";
import { Activity } from "lucide-react";
import { usePostWinStore } from "../../store/usePostWinStore";
import type { ThreadMessage } from "../../store/types";
import type { CaseTimelineEvent } from "../../store/slices/caseTimeline.slice";
import { ChatBubble } from "./ChatBubble";
import { TimelineBubble } from "@ui/chat/UI/common/TimelineBubble";
import { QuestionnaireBubble } from "../../questionaire/QuestionnaireBubble";

/* =========================================================
   Feed Types
========================================================= */

type UnifiedFeedItem =
  | { kind: "chat"; timestamp: string; data: ThreadMessage }
  | { kind: "timeline"; timestamp: string; data: CaseTimelineEvent }
  | { kind: "questionnaire"; timestamp: string };

/* =========================================================
   Component
========================================================= */

export function MessagesSurface() {
  const getUnifiedFeed = usePostWinStore((s) => s.getUnifiedFeed);
  const currentUserId = usePostWinStore((s) => s.currentUserId);
  const composerMode = usePostWinStore((s) => s.composerMode);

  console.log("composerMode", composerMode);

  const feed: UnifiedFeedItem[] = useMemo(() => {
    const base = getUnifiedFeed() as UnifiedFeedItem[];

    // When intake mode is active we append the questionnaire
    if (composerMode === "record") {
      return [
        ...base,
        {
          kind: "questionnaire",
          timestamp: new Date().toISOString(),
        },
      ];
    }

    return base;
  }, [getUnifiedFeed, composerMode]);

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
                  <ChatBubble
                    key={`chat-${item.data.id}-${i}`}
                    message={item.data}
                    isOwn={item.data.authorId === currentUserId}
                  />
                );
              }

              if (item.kind === "timeline") {
                return (
                  <TimelineBubble key={`timeline-${i}`} event={item.data} />
                );
              }

              if (item.kind === "questionnaire") {
                return <QuestionnaireBubble key={`questionnaire-${i}`} />;
              }

              return null;
            })
          )}
        </div>
      </div>

      <div className="h-3 border-t border-line/50 bg-surface-strong" />
    </div>
  );
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

/* =========================================================
   Scalability insight
---------------------------------------------------------
   Future feed types can include:

   system alerts
   moderation flags
   pinned messages
   questionnaires
   verification requests
========================================================= */
