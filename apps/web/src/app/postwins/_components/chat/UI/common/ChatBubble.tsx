// src/app/xotic/postwins/_components/chat/components/ChatBubble.tsx
// Purpose: Dedicated chat bubble renderer for ThreadMessage with functional mode theming (UI-domain only)

"use client";

import React from "react";
import {
  ExternalLink,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  FileText,
  History,
} from "lucide-react";

import type { ThreadMessage } from "@postwin-store/types";
import { handleNavigation } from "@/utils/navigation";

/* =========================================================
   Design reasoning
---------------------------------------------------------
This version extends the original ChatBubble to visually
express the functional chat modes used in the PostWins UX.

record   → discussion
verify   → verification activity
followup → post-decision monitoring
delivery → evidence or execution proof

The component remains a pure presentation layer:
- no store access
- no domain mutation
- no backend dependency
========================================================= */

const MODE_THEMES = {
  record: {
    label: "Discussion",
    icon: MessageCircle,
    styles: "text-blue-600/60 bg-blue-50/50 border-blue-100",
    accent: "border-blue-200 bg-blue-50/20 ring-blue-500/10",
  },
  verify: {
    label: "Verification",
    icon: ShieldCheck,
    styles: "text-purple-600/60 bg-purple-50/50 border-purple-100",
    accent: "border-purple-200 bg-purple-50/20 ring-purple-500/10",
  },
  followup: {
    label: "Follow Up",
    icon: History,
    styles: "text-amber-600/60 bg-amber-50/50 border-amber-100",
    accent: "border-amber-200 bg-amber-50/20 ring-amber-500/10",
  },
  delivery: {
    label: "Evidence",
    icon: FileText,
    styles: "text-emerald-600/60 bg-emerald-50/50 border-emerald-100",
    accent: "border-emerald-200 bg-emerald-50/20 ring-emerald-500/10",
  },
};

export type ChatBubbleProps = {
  message: ThreadMessage;
  isOwn: boolean;
};

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  /* ================= Defensive normalization ================= */

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

  /* ================= Mode detection ================= */

  const theme =
    MODE_THEMES[message.mode as keyof typeof MODE_THEMES] || MODE_THEMES.record;

  const Icon = theme.icon;

  /* =========================================================
     Signals
  ========================================================= */

  const isSignal = [
    "VERIFICATION_REQUEST",
    "COUNTER_CLAIM",
    "EVIDENCE_SUBMISSION",
    "FOLLOW_UP",
  ].includes(safeType);

  return (
    <div
      id={message.id} // 🔑 navigation anchor
      tabIndex={-1} // allows focus during scroll navigation
      className={cn(
        "group flex flex-col mb-4 transition-all focus:outline-none",
        isOwn ? "items-end" : "items-start",
      )}
    >
      {/* =====================================================
         MODE BADGE
      ===================================================== */}

      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-widest mb-1.5 shadow-sm",
          theme.styles,
        )}
      >
        <Icon size={10} strokeWidth={2.5} />
        {theme.label}
      </div>

      {/* =====================================================
         MESSAGE BUBBLE
      ===================================================== */}

      <div
        className={cn(
          "relative max-w-[85%] rounded-[var(--xotic-radius)] border px-4 py-3 text-sm shadow-sm transition-all duration-300",
          isOwn
            ? "bg-surface-strong border-line/60"
            : "bg-surface border-line/40",
          isSignal && theme.accent,
          isSignal && "ring-1",
        )}
      >
        <p className="leading-relaxed text-ink/90 whitespace-pre-wrap">
          {safeBody}
        </p>

        {/* =====================================================
           Contextual navigation actions
        ===================================================== */}

        {navigationContext && (
          <button
            onClick={() => handleNavigation(navigationContext)}
            className="mt-3 flex w-full items-center justify-between gap-2 rounded-md bg-ink/5 px-3 py-2 text-[11px] font-bold text-ink/70 hover:bg-ink/10 transition-colors border border-line/20"
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

      {/* =====================================================
         TIMESTAMP
      ===================================================== */}

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
Parent component must pass `isOwn` using authorId.

Navigation jumps rely on the root container id
to locate and highlight the bubble.

Future features (reactions, replies, moderation)
can be inserted inside the bubble container
without affecting feed logic.
========================================================= */
