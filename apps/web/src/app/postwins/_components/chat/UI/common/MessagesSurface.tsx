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

import React, { useMemo } from "react";
import { Activity } from "lucide-react";
import { usePostWinStore } from "../../store/usePostWinStore";
import type { ThreadMessage } from "../../store/types";
import type { CaseTimelineEvent } from "../../store/slices/caseTimeline.slice";

import { ChatBubble } from "./ChatBubble";
import { TimelineBubble } from "@ui/chat/UI/common/TimelineBubble";
import { QuestionnaireBubble } from "../../questionaire/QuestionnaireBubble";
import { CaseBootstrapBubble } from "./CaseBootstrapBubble";

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

  const feed: UnifiedFeedItem[] = useMemo(() => {
    const base = getUnifiedFeed() as UnifiedFeedItem[];

    // Intake mode appends questionnaire UI to feed
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
              /* =========================================================
                 Chat messages
              ========================================================= */

              if (item.kind === "chat") {
                const meta = item.data.metadata as Record<string, any> | null;

                // Intercept bootstrap system message
                if (
                  item.data.type === "SYSTEM_EVENT" &&
                  meta?.systemEvent === "CASE_BOOTSTRAP"
                ) {
                  return (
                    <CaseBootstrapBubble
                      key={`bootstrap-${item.data.id}`}
                      message={item.data}
                    />
                  );
                }

                return (
                  <ChatBubble
                    key={`chat-${item.data.id}-${i}`}
                    message={item.data}
                    isOwn={item.data.authorId === currentUserId}
                  />
                );
              }

              /* =========================================================
                 Timeline events
              ========================================================= */

              if (item.kind === "timeline") {
                return (
                  <TimelineBubble key={`timeline-${i}`} event={item.data} />
                );
              }

              /* =========================================================
                 Intake questionnaire
              ========================================================= */

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
