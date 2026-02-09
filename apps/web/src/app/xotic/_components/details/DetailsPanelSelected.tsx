// app/components/details/DetailsPanelSelected.tsx
// Details panel skeleton UI with tabbed sections and optional fullscreen action.

"use client";

import { useId, useMemo, useState } from "react";
import { Maximize2 } from "lucide-react"; // Icon for fullscreen affordance (lucide-react)
import { ExplainCasePanel } from "./../chat/explain/ExplainCasePanel";

type Props = {
  onOpenFullScreen?: () => void; // Optional: when present, render a live fullscreen button; otherwise render a skeleton placeholder
};

type TabKey = "overview" | "media" | "files" | "links" | "explain"; // Phase 5.2

export function DetailsPanelSelected({ onOpenFullScreen }: Props) {
  // Memoize tab config to avoid recreating array on every render (small but clean)
  const tabs = useMemo(
    () =>
      [
        { key: "overview", label: "Overview" },
        { key: "media", label: "Media" },
        { key: "files", label: "Files" },
        { key: "links", label: "Links" },
        { key: "explain", label: "Explain" }, // Phase 5.2
      ] as const,
    [],
  );

  // Default tab: Overview (most common “first read” section)
  const [tab, setTab] = useState<TabKey>("overview");

  // useId provides stable, unique IDs per component instance (SSR-safe in React 18)
  const tabsId = useId();

  // Active panel ID used for aria-controls relationships
  const panelId = `${tabsId}-panel-${tab}`;

  return (
    <div className="h-full w-full p-4 overflow-hidden">
      <div className="h-full w-full rounded-[var(--xotic-radius)] border border-line/50 bg-paper overflow-hidden flex flex-col">
        {/* Header: Not sticky inside nested overflow (more stable). Fixed-height zone. */}
        <div className="flex-shrink-0 border-b border-line/50 bg-paper">
          {/* Top row: avatar + title skeleton + actions */}
          <div className="p-[var(--xotic-pad-4)]">
            <div className="flex items-center gap-3">
              {/* Avatar placeholder */}
              <SkeletonCircle size={48} />

              <div className="flex-1 min-w-0">
                {/* Title skeleton */}
                <SkeletonLine className="h-3.5 w-40 max-w-[80%]" />
                {/* Subtitle skeleton */}
                <SkeletonLine className="mt-2 h-3 w-28 max-w-[60%]" />
              </div>

              <div className="flex items-center gap-2">
                {/* Placeholder for “more / menu / action” button slot */}
                <SkeletonBox className="h-10 w-10 rounded-lg" />

                {/* Fullscreen action */}
                {onOpenFullScreen ? (
                  <button
                    type="button"
                    aria-label="Open details in full screen"
                    onClick={onOpenFullScreen}
                    className="
                      h-10 w-10 rounded-lg
                      border border-line/50
                      bg-surface-muted
                      transition-colors
                      hover:bg-surface-muted/70
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      grid place-items-center
                    "
                  >
                    <Maximize2
                      className="h-4 w-4 text-ocean"
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <SkeletonBox className="h-10 w-10 rounded-lg" />
                )}
              </div>
            </div>

            {/* Quick actions row */}
            <div className="mt-4 flex gap-2">
              <SkeletonPill className="h-10 flex-1" />
              <SkeletonPill className="h-10 flex-1" />
              <SkeletonPill className="h-10 flex-1" />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-[var(--xotic-pad-4)] pb-3">
            <div
              role="tablist"
              aria-label="Details sections"
              className="flex items-center gap-1 rounded-[var(--radius-pill)] border border-line/50 bg-surface p-1"
            >
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  aria-controls={`${tabsId}-panel-${t.key}`}
                  id={`${tabsId}-tab-${t.key}`}
                  onClick={() => setTab(t.key)}
                  className={[
                    "h-8 px-3 rounded-[var(--radius-pill)] text-xs transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    tab === t.key
                      ? "bg-paper text-ink border border-line/50"
                      : "text-ink/70 hover:bg-surface-muted/60",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto p-[var(--xotic-pad-4)] space-y-4"
          role="tabpanel"
          id={panelId}
          aria-labelledby={`${tabsId}-tab-${tab}`}
        >
          {tab === "overview" && <OverviewSection />}
          {tab === "media" && <MediaSection />}
          {tab === "files" && <FilesSection />}
          {tab === "links" && <LinksSection />}
          {tab === "explain" && <ExplainCasePanel caseId={"TODO_CASE_ID"} />}

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

/* ----------------------- TAB CONTENT ----------------------- */

function OverviewSection() {
  return (
    <SectionCard title="About">
      <SkeletonLine className="mt-3 h-3 w-64 max-w-[90%]" />
      <SkeletonLine className="mt-2 h-3 w-56 max-w-[80%]" />
      <SkeletonLine className="mt-2 h-3 w-40 max-w-[60%]" />
    </SectionCard>
  );
}

function MediaSection() {
  return (
    <SectionCard title="Media" rightChip>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBox
            key={i}
            className="aspect-square rounded-[var(--xotic-radius-sm)]"
          />
        ))}
      </div>
    </SectionCard>
  );
}

function FilesSection() {
  return (
    <SectionCard title="Files" rightChip>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox
            key={i}
            className="h-12 w-full rounded-[var(--xotic-radius-sm)]"
          />
        ))}
      </div>
    </SectionCard>
  );
}

function LinksSection() {
  return (
    <SectionCard title="Links" rightChip>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox
            key={i}
            className="h-10 w-full rounded-[var(--xotic-radius-sm)]"
          />
        ))}
      </div>
    </SectionCard>
  );
}

/* ----------------------- REUSABLE UI ----------------------- */

function SectionCard({
  title,
  rightChip,
  children,
}: {
  title: string;
  rightChip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--xotic-radius-sm)] border border-line/50 bg-surface p-[var(--xotic-pad-4)]">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink/55">
          {title}
        </div>
        {rightChip ? <SkeletonLine className="h-3 w-10" /> : null}
      </div>
      {children}
    </section>
  );
}

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={["bg-surface-muted border border-line/50", className].join(
        " ",
      )}
      aria-hidden="true"
    />
  );
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "rounded bg-surface-muted border border-line/50",
        className,
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

function SkeletonCircle({ size }: { size: number }) {
  return (
    <div
      className="rounded-full bg-surface-muted border border-line/50 flex-shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

function SkeletonPill({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "rounded-[var(--radius-pill)] bg-surface-muted border border-line/50",
        className,
      ].join(" ")}
      aria-hidden="true"
    />
  );
}
