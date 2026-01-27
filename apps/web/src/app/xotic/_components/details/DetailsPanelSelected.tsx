// app/components/details/DetailsPanelSelected.tsx — Details panel skeleton UI with tabbed sections and optional fullscreen action.

"use client";

import { useId, useMemo, useState } from "react";
import { Maximize2 } from "lucide-react"; // Icon for fullscreen affordance (lucide-react)

type Props = {
  onOpenFullScreen?: () => void; // Optional: when present, render a live fullscreen button; otherwise render a skeleton placeholder
};

type TabKey = "overview" | "media" | "files" | "links"; // Union keeps tab state constrained + type-safe

export function DetailsPanelSelected({ onOpenFullScreen }: Props) {
  // Memoize tab config to avoid recreating array on every render (small but clean)
  const tabs = useMemo(
    () =>
      [
        { key: "overview", label: "Overview" },
        { key: "media", label: "Media" },
        { key: "files", label: "Files" },
        { key: "links", label: "Links" },
      ] as const,
    []
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

                {/* Fullscreen action:
                    - If handler exists, render real interactive button
                    - If not, render skeleton to avoid dead controls */}
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

            {/* Quick actions row: pill placeholders to signal available actions */}
            <div className="mt-4 flex gap-2">
              <SkeletonPill className="h-10 flex-1" />
              <SkeletonPill className="h-10 flex-1" />
              <SkeletonPill className="h-10 flex-1" />
            </div>
          </div>

          {/* Tabs: uses proper tab semantics for accessibility */}
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
                  aria-selected={tab === t.key} // Communicates active tab to AT
                  aria-controls={`${tabsId}-panel-${t.key}`} // Points to the tabpanel region
                  id={`${tabsId}-tab-${t.key}`} // Used by aria-labelledby on tabpanel
                  onClick={() => setTab(t.key)} // Tab switch is synchronous and lightweight
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

        {/* Body scroll: single scroll container prevents nested scroll traps */}
        <div
          className="flex-1 overflow-y-auto p-[var(--xotic-pad-4)] space-y-4"
          role="tabpanel"
          id={panelId}
          aria-labelledby={`${tabsId}-tab-${tab}`} // Links active panel to active tab
        >
          {/* Conditional render keeps DOM light and avoids hiding large blocks */}
          {tab === "overview" && <OverviewSection />}
          {tab === "media" && <MediaSection />}
          {tab === "files" && <FilesSection />}
          {tab === "links" && <LinksSection />}

          {/* Spacer to avoid last item kissing the bottom edge */}
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
      {/* Lines approximate paragraph layout */}
      <SkeletonLine className="mt-3 h-3 w-64 max-w-[90%]" />
      <SkeletonLine className="mt-2 h-3 w-56 max-w-[80%]" />
      <SkeletonLine className="mt-2 h-3 w-40 max-w-[60%]" />
    </SectionCard>
  );
}

function MediaSection() {
  return (
    <SectionCard title="Media" rightChip>
      {/* Grid skeleton: suggests thumbnails */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBox
            key={i} // Index key is fine for static skeleton lists (no reordering)
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
      {/* List skeleton: suggests file rows */}
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
      {/* List skeleton: suggests link rows */}
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
  title: string; // Section label (e.g., About/Media)
  rightChip?: boolean; // Optional placeholder chip to imply secondary status/actions
  children: React.ReactNode; // Section body content
}) {
  return (
    <section className="rounded-[var(--xotic-radius-sm)] border border-line/50 bg-surface p-[var(--xotic-pad-4)]">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink/55">
          {title}
        </div>
        {/* Right-side skeleton chip placeholder */}
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
        " "
      )} // Tokenized surfaces for theme consistency
      aria-hidden="true" // Decorative skeletons should be ignored by screen readers
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
      style={{ width: size, height: size }} // Inline style used for dynamic sizing without extra classes
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

/* -------------------------------------------------------------------------------------------------
Design reasoning
- The panel uses a single scroll container for the body to avoid nested scroll traps and improve mobile ergonomics.
- Tabs implement real WAI-ARIA semantics (tablist/tab/tabpanel) so keyboard and screen-reader users can navigate reliably.
- Skeleton placeholders preserve layout stability and communicate “loading / selected state pending” without flashing content.
- The fullscreen control is only interactive when a handler exists, preventing dead buttons that degrade UX trust.

Structure
- DetailsPanelSelected: main exported component (tabs + body).
- OverviewSection/MediaSection/FilesSection/LinksSection: tab content stubs using shared SectionCard.
- SectionCard + Skeleton primitives: reusable UI building blocks for consistent skeleton styling.

Implementation guidance
- Replace skeleton primitives with real data components once selection data is available; keep tab structure unchanged.
- When data-driven, keep tab keys aligned with `TabKey` and the `tabs` config to avoid drift.
- For the fullscreen button, render an icon inside the button (e.g., Lucide `Maximize2`) once you decide the design.
- If you add routing-based tabs, derive `tab` from URL state and keep `aria-controls` IDs stable via `useId`.

Scalability insight
- Extract the tab system into a shared `Tabs` component if multiple panels use the same semantics and styling.
- Swap skeleton primitives with a tokenized `Skeleton` component library to standardize animation and reduce duplication.
- Add virtualization or pagination when Media/Files/Links become large lists—keep the panel’s single-scroll container pattern.
-------------------------------------------------------------------------------------------------- */
