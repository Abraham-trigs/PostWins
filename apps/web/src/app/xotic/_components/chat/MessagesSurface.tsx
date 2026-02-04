// xotic/_components/chat/MessagesSurface.tsx
"use client";

import React from "react";
import { Activity } from "lucide-react";
import type { ChatMessage, ComposerMode } from "./store/types";

export function MessagesSurface({
  messages = [],
  onAction,
}: {
  messages?: ChatMessage[];
  onAction?: (action: { id: string; label: string; value: string }) => void;
}) {
  return (
    <div
      aria-label="Messages surface"
      className="h-full w-full rounded-[var(--xotic-radius)] border border-line/50 bg-paper overflow-hidden flex flex-col"
    >
      <div className="flex-1 overflow-y-auto p-[var(--xotic-pad-4)]">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-line/50 bg-surface-strong text-xs text-ink/70">
                <Activity className="h-4 w-4 text-ocean" aria-hidden="true" />
                No messages yet
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <MessageRow key={m.id} msg={m} onAction={onAction} />
            ))
          )}

          <div className="h-6" />
        </div>
      </div>

      <div className="h-3 border-t border-line/50 bg-surface-strong" />
    </div>
  );
}

function MessageRow({
  msg,
  onAction,
}: {
  msg: ChatMessage;
  onAction?: (action: { id: string; label: string; value: string }) => void;
}) {
  switch (msg.kind) {
    case "text":
      return <TextBubble role={msg.role} text={msg.text} mode={msg.mode} />;
    case "event":
      return (
        <EventCard title={msg.title} meta={msg.meta} status={msg.status} />
      );
    case "form_block":
      return <FormBlock step={msg.step} />;
    case "action_row":
      return <ActionRow actions={msg.actions} onAction={onAction} />;
    default:
      return assertNever(msg);
  }
}

function assertNever(x: never) {
  // If a new ChatMessage.kind is added and not handled above, TS errors here.
  return null;
}

function TextBubble({
  role,
  text,
  mode,
}: {
  role: Extract<ChatMessage, { kind: "text" }>["role"];
  text: string;
  mode: ComposerMode;
}) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%] space-y-1">
        <div
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            isUser ? "text-ink/60 text-right" : "text-ink/60"
          }`}
        >
          {mode}
        </div>

        <div
          className={[
            "rounded-[var(--xotic-radius)] border border-line/50 px-4 py-2 text-sm",
            isUser ? "bg-surface-strong text-ink" : "bg-surface text-ink",
          ].join(" ")}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function EventCard({
  title,
  meta,
  status,
}: {
  title: string;
  meta: string;
  status: "logged" | "pending" | "failed";
}) {
  return (
    <div className="rounded-[var(--xotic-radius)] border border-line/50 bg-surface p-4">
      <div className="text-sm font-medium text-ink">{title}</div>
      <div className="text-xs text-ink/65">{meta}</div>
      <div className="mt-2 text-xs text-ink/70">
        {status === "logged"
          ? "Logged"
          : status === "pending"
            ? "Pending"
            : "Failed"}
      </div>
    </div>
  );
}

function FormBlock({
  step,
}: {
  step: Extract<ChatMessage, { kind: "form_block" }>["step"];
}) {
  return (
    <div className="rounded-[var(--xotic-radius)] border border-line/50 bg-surface p-4">
      <div className="text-sm font-semibold text-ink">Form: {step}</div>
      <div className="text-xs text-ink/65 mt-1">
        (This is where the visible in-chat form goes.)
      </div>
    </div>
  );
}

function ActionRow({
  actions,
  onAction,
}: {
  actions: Extract<ChatMessage, { kind: "action_row" }>["actions"];
  onAction?: (action: { id: string; label: string; value: string }) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          className="rounded-full border border-line/50 bg-surface-strong px-3 py-2 text-xs font-semibold text-ink hover:bg-surface"
          onClick={() => onAction?.(a)}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
