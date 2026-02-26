// src/app/xotic/postwins/_components/chat/components/ChatBubble.tsx
// Purpose: Dedicated chat bubble renderer for ThreadMessage (UI-domain only)

"use client";

import React from "react";
import { ExternalLink, ArrowRight } from "lucide-react";
import type { ThreadMessage } from "@postwin-store/types";
import { handleNavigation } from "@/utils/navigation";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   ChatBubble is a pure presentation component for
   ThreadMessage. It owns:
   - Visual rendering
   - Navigation projection
   - Defensive normalization

   It does NOT:
   - Access store directly
   - Mutate message state
   - Depend on backend contracts
========================================================= */

/* =========================================================
   Structure
   ---------------------------------------------------------
   - ChatBubble (exported)
   - Internal safe normalization logic
========================================================= */

export type ChatBubbleProps = {
  message: ThreadMessage;
  isOwn: boolean;
};

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const safeType =
    typeof message.type === "string" && message.type.length > 0
      ? message.type
      : "DISCUSSION";

  const safeBody =
    typeof message.body === "string" && message.body.length > 0
      ? message.body
      : "";

  const safeCreatedAt =
    message.createdAt && !isNaN(new Date(message.createdAt).getTime())
      ? new Date(message.createdAt)
      : new Date();

  const navigationContext = message.navigationContext ?? null;

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
        id={message.id}
        className={`relative max-w-[85%] rounded-[var(--xotic-radius)] border px-4 py-3 text-sm shadow-sm transition-all
          ${
            isOwn
              ? "bg-surface-strong border-line"
              : "bg-surface border-line/50"
          }
          ${isSignal ? "border-ocean/30 bg-ocean/5 ring-1 ring-ocean/10" : ""}`}
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
   Implementation guidance
   ---------------------------------------------------------
   - Parent component must pass isOwn based on authorId.
   - Message lifecycle updates (edited/deleted) should
     modify ThreadMessage, not this component.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If message actions grow (edit, reply, react, pin),
   inject <MessageActions /> inside this component
   without touching container logic.
========================================================= */
