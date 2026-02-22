"use client";

// apps/web/src/app/xotic/postwins/_components/chat/DesktopChatList.tsx
// Purpose: Left panel powered by cursor-based normalized cases store

import { useEffect, useRef, useState } from "react";
import { Plus, Search, RotateCw } from "lucide-react";
import { usePostWinStore } from "../chat/store/usePostWinStore";
import { useCasesStore } from "../chat/store/useCasesStore";
import type { CaseListItem } from "@posta/core";
import {
  lifecyclePresentationMap,
  routingPresentationMap,
} from "@/lib/presentation/postwin.presentation";

/* ============================================================
   Design reasoning
   ------------------------------------------------------------
   - Purely state-driven from normalized store.
   - Cursor pagination via fetchMore().
   - Store-level debounce.
   - UI does not compute lifecycle or routing.
   - Infinite-scroll safe.
   ============================================================ */

type Props = {
  activeId: string | null;
  onSelect: (id: string) => void;
};

type DesktopChatRowProps = {
  item: CaseListItem;
  active?: boolean;
  onSelect?: () => void;
};

/* ------------------------------------------------------------ */

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

function buildTitle(p: CaseListItem): string {
  const idShort = p.id.slice(0, 8);
  return p.summary?.trim()
    ? p.summary.trim()
    : p.sdgGoal
      ? `PostWin ${idShort} • ${p.sdgGoal}`
      : `PostWin ${idShort}`;
}

/* ------------------------------------------------------------ */
/* Lifecycle Badge */
/* ------------------------------------------------------------ */

function LifecycleBadge({
  lifecycle,
}: {
  lifecycle: CaseListItem["lifecycle"];
}) {
  const { label, tone } = lifecyclePresentationMap[lifecycle];

  const toneClass =
    tone === "success"
      ? "bg-[var(--state-success)]/20 text-[var(--state-success)]"
      : tone === "danger"
        ? "bg-[var(--state-danger)]/20 text-[var(--state-danger)]"
        : tone === "warning"
          ? "bg-[var(--state-warning)]/20 text-[var(--state-warning)]"
          : tone === "info"
            ? "bg-ocean/20 text-ocean"
            : "bg-surface-muted text-ink/80";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full ${toneClass}`}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------ */
/* Routing Badge */
/* ------------------------------------------------------------ */

function RoutingBadge({
  outcome,
}: {
  outcome: CaseListItem["routingOutcome"];
}) {
  const { label, tone } = routingPresentationMap[outcome];

  const toneClass =
    tone === "success"
      ? "bg-[var(--state-success)]/20 text-[var(--state-success)]"
      : tone === "danger"
        ? "bg-[var(--state-danger)]/20 text-[var(--state-danger)]"
        : tone === "warning"
          ? "bg-[var(--state-warning)]/20 text-[var(--state-warning)]"
          : "bg-surface-muted text-ink/80";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full ${toneClass}`}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------ */

function DesktopChatRow({ item, active, onSelect }: DesktopChatRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role="option"
      aria-selected={!!active}
      className={[
        "w-full text-left group relative",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-surface-strong" : "bg-transparent hover:bg-surface",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "absolute left-0 top-2 bottom-2 w-1 rounded-r-full",
          active ? "bg-[var(--state-danger)]" : "bg-transparent",
        ].join(" ")}
      />

      <div className="flex items-center gap-3 px-[var(--xotic-pad-4)] py-[var(--xotic-pad-3)]">
        <div className="h-10 w-10 rounded-full bg-surface-muted border border-line/50 flex-shrink-0" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {buildTitle(item)}
          </p>

          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <LifecycleBadge lifecycle={item.lifecycle} />
            <RoutingBadge outcome={item.routingOutcome} />
          </div>
        </div>

        <div className="text-[11px] text-ink/55">
          {formatTime(item.updatedAt)}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------ */

export function DesktopChatList({ activeId, onSelect }: Props) {
  const bootstrapPostWin = usePostWinStore((s) => s.bootstrapPostWin);

  const orderedIds = useCasesStore((s) => s.orderedIds);
  const byId = useCasesStore((s) => s.byId);
  const loading = useCasesStore((s) => s.loading);
  const error = useCasesStore((s) => s.error);
  const fetchInitial = useCasesStore((s) => s.fetchInitial);
  const fetchMore = useCasesStore((s) => s.fetchMore);
  const hasMore = useCasesStore((s) => s.hasMore);
  const setSearch = useCasesStore((s) => s.setSearch);

  /* ---------------- Initial Load ---------------- */

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  /* ---------------- Search ---------------- */

  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    setSearch(localSearch);
  }, [localSearch, setSearch]);

  /* ---------------- Infinite Scroll ---------------- */

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchMore, hasMore]);

  return (
    <aside className="w-[var(--xotic-list-w)] flex-shrink-0 bg-paper border-r border-line/40 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-[var(--xotic-topbar-h)] px-[var(--xotic-pad-4)] flex items-center gap-2 bg-paper border-b border-line/40">
        <div className="min-w-0 flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/55" />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search PostWins…"
            className="w-full h-9 rounded-full pl-9 pr-4 text-sm bg-surface-strong text-ink border border-line/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <button
          onClick={fetchInitial}
          disabled={loading}
          className="h-9 w-9 rounded-full grid place-items-center border border-line/50 bg-surface-strong disabled:opacity-60"
        >
          <RotateCw className="h-4 w-4" />
        </button>

        <button
          onClick={bootstrapPostWin}
          className="h-9 px-4 rounded-full bg-[var(--brand-primary)] text-ink text-sm font-semibold inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <div role="listbox" className="py-2">
          {error && (
            <div className="px-4 py-3 text-sm text-[var(--state-danger)]">
              {error}
            </div>
          )}

          {orderedIds.map((id) => {
            const item = byId[id];
            if (!item) return null;

            return (
              <DesktopChatRow
                key={item.id}
                item={item}
                active={item.id === activeId}
                onSelect={() => onSelect(item.id)}
              />
            );
          })}

          {!loading && orderedIds.length === 0 && !error && (
            <div className="px-4 py-6 text-sm text-ink/75">
              No PostWins found.
            </div>
          )}

          {loading && (
            <div className="px-4 py-3 text-sm text-ink/70">Loading…</div>
          )}

          <div ref={sentinelRef} />
        </div>
      </div>
    </aside>
  );
}

/* ============================================================
   Structure
   ------------------------------------------------------------
   - Store-driven list
   - Badge presentation
   - Infinite scroll sentinel
   - Debounced search
   ============================================================ */

/* ============================================================
   Scalability insight
   ------------------------------------------------------------
   - Cursor pagination prevents offset degradation.
   - Normalized state avoids duplication.
   - No lifecycle computation on client.
   - Infinite scroll safe under heavy writes.
   ============================================================ */
