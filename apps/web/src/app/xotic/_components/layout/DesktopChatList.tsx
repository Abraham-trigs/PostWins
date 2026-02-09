"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { Plus, Search, RotateCw } from "lucide-react";
import { usePostWinStore } from "../chat/store/usePostWinStore";
import { listCases, type CaseListItem } from "../../../../lib/api/cases.api";

type Props = {
  activeId: string | null;
  onSelect: (id: string) => void;
};

type ChatRow = {
  id: string; // UUID
  title: string;
  preview: string;
  time: string;
  unread: boolean;
};

type DesktopChatRowProps = {
  chat: ChatRow;
  active?: boolean;
  onSelect?: () => void;
};

function DesktopChatRow({ chat, active, onSelect }: DesktopChatRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role="option"
      aria-selected={!!active}
      className={[
        "w-full text-left group relative",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "transition-colors duration-200",
        active ? "bg-surface-strong" : "bg-transparent hover:bg-surface",
      ].join(" ")}
    >
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
        <div className="h-10 w-10 rounded-full bg-surface-muted border border-line/50 flex-shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <p
              className={[
                "truncate text-sm font-semibold",
                active ? "text-ink" : "text-ink/90",
              ].join(" ")}
            >
              {chat.title}
            </p>

            {chat.unread && (
              <span className="inline-flex items-center rounded-full bg-ocean/15 px-2 py-0.5 text-[11px] font-semibold text-ocean">
                New
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-xs text-ink/70">{chat.preview}</p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-[11px] text-ink/55">{chat.time}</span>

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

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function buildTitle(c: CaseListItem): string {
  const idShort = c.id.slice(0, 8);
  return c.summary?.trim()
    ? c.summary.trim()
    : c.sdgGoal
      ? `Case ${idShort} • ${c.sdgGoal}`
      : `Case ${idShort}`;
}

function buildPreview(c: CaseListItem): string {
  return `${c.status} • ${c.routingStatus} • ${c.type}`;
}

export function DesktopChatList({ activeId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const bootstrapPostWin = usePostWinStore((s) => s.bootstrapPostWin);

  // ✅ watch store ids: when bootstrap succeeds it sets ids.projectId
  const latestProjectId = usePostWinStore((s) => s.ids.projectId);

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await listCases();

      const mapped: ChatRow[] = res.cases.map((c) => ({
        id: c.id,
        title: buildTitle(c),
        preview: buildPreview(c),
        time: formatTime(c.updatedAt ?? c.createdAt),
        unread: false,
      }));

      setRows(mapped);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load cases");
    } finally {
      setLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  // ✅ refresh list after a successful bootstrap created a new case
  useEffect(() => {
    if (!latestProjectId) return;
    void loadCases();
  }, [latestProjectId, loadCases]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <aside
      aria-label="Chat list"
      className={[
        "w-[var(--xotic-list-w)] flex-shrink-0",
        "bg-paper",
        "border-r border-line/40",
        "flex flex-col overflow-hidden",
      ].join(" ")}
    >
      <div
        className={[
          "h-[var(--xotic-topbar-h)] flex-shrink-0",
          "px-[var(--xotic-pad-4)] flex items-center gap-2",
          "bg-paper",
          "border-b border-line/40",
        ].join(" ")}
      >
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="xotic-search">
            Search cases
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
              placeholder="Search cases…"
              className={[
                "w-full h-9 rounded-full pl-9 pr-4 text-sm",
                "bg-surface-strong text-ink placeholder:text-ink/55",
                "border border-line/50",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              ].join(" ")}
            />
          </div>
        </div>

        {/* ✅ refresh */}
        <button
          type="button"
          aria-label="Refresh cases"
          onClick={() => void loadCases()}
          disabled={loading}
          className={[
            "h-9 w-9 rounded-full grid place-items-center",
            "border border-line/50 bg-surface-strong text-ink/70",
            "hover:bg-surface transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* ✅ create new case: DO NOT change selection here */}
        <button
          type="button"
          aria-label="Create new case"
          onClick={bootstrapPostWin}
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

      <div className="flex-1 overflow-y-auto">
        <div role="listbox" aria-label="Cases" className="py-2">
          {loading && (
            <div className="px-[var(--xotic-pad-4)] py-3 text-sm text-ink/70">
              Loading…
            </div>
          )}

          {err && (
            <div className="px-[var(--xotic-pad-4)] py-3 text-sm text-[var(--state-danger)]">
              {err}
            </div>
          )}

          {!loading &&
            !err &&
            filtered.map((c) => (
              <DesktopChatRow
                key={c.id}
                chat={c}
                active={c.id === activeId}
                onSelect={() => onSelect(c.id)}
              />
            ))}

          {!loading && !err && filtered.length === 0 && (
            <div className="px-[var(--xotic-pad-4)] py-[var(--xotic-pad-6)] text-sm text-ink/75">
              No results for “{query}”.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
