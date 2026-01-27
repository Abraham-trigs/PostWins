// xotic/_components/layout/DesktopChatList.tsx
// Desktop left-rail chat/thread list with selectable rows and unread indicators.

"use client";

import { useMemo } from "react";
import { DesktopListHeader } from "./DesktopListHeader";

type ChatStub = {
  id: string;
  title: string;
  preview: string;
  time: string;
  unread: boolean;
};

function DesktopChatRow({
  chat,
  active,
  onSelect,
}: {
  chat: ChatStub;
  active?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={[
        "w-full text-left group relative transition-colors duration-200",
        active ? "bg-surface-strong" : "bg-paper hover:bg-surface",
      ].join(" ")}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--state-danger)]" />
      )}

      <div className="flex items-center gap-3 px-[var(--xotic-pad-4)] py-[var(--xotic-pad-3)]">
        <div className="h-10 w-10 rounded-full bg-surface-muted border border-line/50 flex-shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {chat.title}
            </p>

            {chat.unread && (
              <span className="flex-shrink-0 inline-flex items-center rounded-full bg-ocean/15 px-2 py-0.5 text-[11px] font-bold text-ocean">
                New
              </span>
            )}
          </div>

          <p
            className={[
              "mt-1 truncate text-xs",
              active ? "text-ink/70" : "text-ink/65",
            ].join(" ")}
          >
            {chat.preview}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span
            className={[
              "text-[11px]",
              active ? "text-ink/60" : "text-ink/50",
            ].join(" ")}
          >
            {chat.time}
          </span>

          <span
            aria-hidden="true"
            className={[
              "h-2 w-2 rounded-full",
              chat.unread
                ? "bg-[var(--state-danger)]"
                : "border border-line/50",
            ].join(" ")}
          />
        </div>
      </div>
    </button>
  );
}

export function DesktopChatList({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const chats = useMemo<ChatStub[]>(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: `thread_${i + 1}`,
        title: `Project ${String(i + 1).padStart(2, "0")}`,
        preview: "Delivery recorded • Follow-up pending",
        time: "2h",
        unread: (i + 1) % 4 === 0,
      })),
    []
  );

  return (
    <aside className="w-[var(--xotic-list-w)] flex-shrink-0 bg-paper border-r border-line/40 flex flex-col overflow-hidden">
      <DesktopListHeader />

      <div className="flex-1 overflow-y-auto">
        <nav aria-label="Chats" className="py-2">
          {chats.map((chat) => (
            <DesktopChatRow
              key={chat.id}
              chat={chat}
              active={chat.id === activeId}
              onSelect={() => onSelect(chat.id)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
