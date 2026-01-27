"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

type Props = {
  activeId: number | null;
  onSelect: (id: number) => void;
};

type ChatStub = {
  id: number;
  title: string;
  preview: string;
  time: string;
  unread: boolean;
};

type DesktopChatRowProps = {
  chat: ChatStub;
  active?: boolean;
  onSelect?: () => void;
};

/**
 * DesktopChatRow (dark rail on COLOR-ONE surface)
 * Palette (new):
 * - Surface: --color-one (#03102B)
 * - Hover/active surface tint: --color-two (#08204C)
 * - Accent: --color-four (#4F77A5)
 * - Muted text: --color-five (#BBCFCA)
 * - High accent: --color-high (#FF0000)  (micro only)
 *
 * UPDATED (synced to globals.css):
 * - Main surface: bg-paper (surface-primary)
 * - Hover surface: bg-surface
 * - Active surface: bg-surface-strong
 * - Accent (links/info): text-ocean / ring-ring
 * - Primary action: var(--brand-primary)
 * - Lines/borders: border-line
 * - High accent: var(--state-danger) (micro only)
 */
function DesktopChatRow({ chat, active, onSelect }: DesktopChatRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role="option"
      aria-selected={!!active}
      className={[
        // Layout
        "w-full text-left group relative",
        // A11y
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // Interaction: tints via surface tokens (keeps everything in-system)
        "transition-colors duration-200",
        active ? "bg-surface-strong" : "bg-transparent hover:bg-surface",
      ].join(" ")}
    >
      {/* Active indicator rail (high accent only) */}
      <span
        aria-hidden="true"
        className={[
          "absolute left-0 top-2 bottom-2 w-1 rounded-r-full",
          "transition-transform duration-200 origin-center",
          active
            ? "bg-[var(--state-danger)] scale-y-100"
            : "bg-transparent scale-y-0",
        ].join(" ")}
      />

      <div className="flex items-center gap-3 px-[var(--xotic-pad-4)] py-[var(--xotic-pad-3)]">
        {/* Avatar placeholder
            - Subtle fill + line border for definition */}
        <div className="h-10 w-10 rounded-full bg-surface-muted border border-line/50 flex-shrink-0" />

        {/* Main text */}
        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex items-center gap-2 min-w-0">
            <p
              className={[
                "truncate text-sm font-semibold",
                // Keep text bright but not harsh; active increases contrast slightly
                active ? "text-ink" : "text-ink/90",
              ].join(" ")}
            >
              {chat.title}
            </p>

            {/* Unread badge (soft, not loud)
                - Uses ocean tint; avoids red (reserved for critical) */}
            {chat.unread && (
              <span className="inline-flex items-center rounded-full bg-ocean/15 px-2 py-0.5 text-[11px] font-semibold text-ocean">
                New
              </span>
            )}
          </div>

          {/* Preview (muted) */}
          <p className="mt-1 truncate text-xs text-ink/70">{chat.preview}</p>
        </div>

        {/* Meta */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-[11px] text-ink/55">{chat.time}</span>

          {/* Unread dot
              - High accent only when unread
              - Otherwise subtle outline */}
          <span
            aria-hidden="true"
            className={[
              "h-2.5 w-2.5 rounded-full",
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

/**
 * DesktopChatList (dark rail on COLOR-ONE surface)
 * - Main surface: --color-one
 * - Separators: color-four (tinted)
 * - Text: color-five (soft light)
 * - Focus ring: color-four
 *
 * UPDATED (synced to globals.css):
 * - Main surface: bg-paper
 * - Separators: border-line
 * - Text: text-ink (with opacity for hierarchy)
 * - Focus ring: ring-ring
 */
export function DesktopChatList({ activeId, onSelect }: Props) {
  const [query, setQuery] = useState("");

  // NOTE: Stubbed data for now; swap to server data later without changing UI structure.
  const chats = useMemo<ChatStub[]>(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const id = i + 1;
        return {
          id,
          title: `Project ${String(id).padStart(2, "0")}`,
          preview: "Delivery recorded • Follow-up pending • Verification soon",
          time: "2h",
          unread: id % 4 === 0,
        };
      }),
    []
  );

  // NOTE: Simple client-side filter; replace with debounced server search when wired.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)
    );
  }, [chats, query]);

  return (
    <aside
      aria-label="Chat list"
      className={[
        // Sizing based on your density/layout tokens
        "w-[var(--xotic-list-w)] flex-shrink-0",
        // Main surface
        "bg-paper",
        // Separators
        "border-r border-line/40",
        // Structure
        "flex flex-col overflow-hidden",
      ].join(" ")}
    >
      {/* Header */}
      <div
        className={[
          "h-[var(--xotic-topbar-h)] flex-shrink-0",
          "px-[var(--xotic-pad-4)] flex items-center gap-2",
          "bg-paper",
          "border-b border-line/40",
        ].join(" ")}
      >
        {/* Search */}
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="xotic-search">
            Search chats
          </label>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/55"
              aria-hidden="true"
            />
            <input
              id="xotic-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, stakeholders…"
              className={[
                "w-full h-9 rounded-full pl-9 pr-4 text-sm",
                // Input surface + line border for definition
                "bg-surface-strong text-ink placeholder:text-ink/55",
                "border border-line/50",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              ].join(" ")}
            />
          </div>
        </div>

        {/* New chat CTA
            - Uses brand primary for action surface
            - Keeps high (red) reserved for alerts/critical commit */}
        <button
          type="button"
          aria-label="Create new chat"
          className={[
            "h-9 px-4 rounded-full",
            "bg-[var(--brand-primary)] text-ink text-sm font-semibold",
            "hover:opacity-95 transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "active:scale-95",
            "inline-flex items-center gap-2",
          ].join(" ")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <div role="listbox" aria-label="Chats" className="py-2">
          {filtered.map((c) => (
            <DesktopChatRow
              key={c.id}
              chat={c}
              active={c.id === activeId}
              onSelect={() => onSelect(c.id)}
            />
          ))}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="px-[var(--xotic-pad-4)] py-[var(--xotic-pad-6)] text-sm text-ink/75">
              No results for “{query}”.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
