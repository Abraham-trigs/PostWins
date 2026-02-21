// src/app/xotic/postwins/_components/chat/MessagesSurface.tsx
"use client";

import React from "react";
import { Activity, ExternalLink, ArrowRight } from "lucide-react";
import { usePostWinStore } from "./store/usePostWinStore";
import { handleNavigation } from "@/utils/navigation"; // Import our utility
import type { BackendMessage } from "@/lib/api/message";

export function MessagesSurface() {
  const messages = usePostWinStore((s) => s.messages);
  // Note: Ensure your store/currentUserId logic matches your auth state
  const currentUserId = usePostWinStore((s) => (s as any).currentUserId);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div className="h-full w-full rounded-[var(--xotic-radius)] border border-line/50 bg-paper overflow-hidden flex flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-none p-4"
      >
        <div className="mx-auto w-full max-w-3xl space-y-6">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((m) => (
              <MessageRow
                key={m.id}
                msg={m}
                isOwn={m.authorId === currentUserId}
              />
            ))
          )}
        </div>
      </div>
      <div className="h-3 border-t border-line/50 bg-surface-strong" />
    </div>
  );
}

/* =========================================================
   Message Row (Updated with Navigation Action)
========================================================= */

function MessageRow({ msg, isOwn }: { msg: BackendMessage; isOwn: boolean }) {
  const { type, body, navigationContext } = msg;

  const isSignal = [
    "VERIFICATION_REQUEST",
    "COUNTER_CLAIM",
    "EVIDENCE_SUBMISSION",
    "FOLLOW_UP",
  ].includes(type);

  return (
    <div
      className={`group flex flex-col ${isOwn ? "items-end" : "items-start"} mb-4`}
    >
      {/* Semantic Label */}
      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1 px-1">
        {type.replace("_", " ")}
      </span>

      {/* Message Bubble */}
      <div
        id={msg.id} // Essential for "MESSAGE" target navigation
        className={`
          relative max-w-[85%] rounded-[var(--xotic-radius)] border px-4 py-3 text-sm shadow-sm transition-all
          ${isOwn ? "bg-surface-strong border-line" : "bg-surface border-line/50"}
          ${isSignal ? "border-ocean/30 bg-ocean/5 ring-1 ring-ocean/10" : ""}
        `}
      >
        <p className="leading-relaxed text-ink/90 whitespace-pre-wrap">
          {body}
        </p>

        {/* 🔗 Navigation Action (The Signal Logic) */}
        {navigationContext && (
          <button
            onClick={() => handleNavigation(navigationContext)}
            className="mt-3 flex w-full items-center justify-between gap-2 rounded-md bg-ocean/10 px-3 py-2 text-xs font-semibold text-ocean hover:bg-ocean/20 transition-colors border border-ocean/20"
          >
            <span className="truncate">
              {navigationContext.label || `View ${navigationContext.target}`}
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
        {new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
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
