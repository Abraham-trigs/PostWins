"use client";

import { useEffect, useMemo, useState } from "react";
import { MobileSearch } from "../mobile/MobileSearch";
import { MobileTabs } from "../mobile/MobileTabs";
import { MobileChatHeader } from "../mobile/MobileChatHeader";
import { MobileComposer } from "../mobile/MobileComposer";
import { TabletChatRow } from "../tablet/TabletChatRow";
import { ChatEmptyState } from "../chat/ChatEmptyState";
import { MessagesSurface } from "../chat/MessagesSurface";
import { TabletDetailsDrawer } from "../layout/TabletDetailsDrawer";
import { DetailsFullScreenOverlay } from "../details/DetailsFullScreenOverlay";

export function TabletSplit() {
  const chats = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({ id: i + 1 })),
    []
  );

  // start with nothing selected → empty state
  const [activeId, setActiveId] = useState<number | null>(null);

  // details drawer (tablet only)
  const [detailsOpen, setDetailsOpen] = useState(false);

  // details full screen overlay (tablet)
  const [detailsFullOpen, setDetailsFullOpen] = useState(false);

  // if no chat selected, ensure drawer is closed (and fullscreen too)
  useEffect(() => {
    if (activeId === null) {
      setDetailsOpen(false);
      setDetailsFullOpen(false);
    }
  }, [activeId]);

  return (
    <div className="h-full w-full bg-background">
      <div className="h-full w-full flex overflow-hidden">
        {/* Left: chats list (independent scroll) */}
        <aside className="w-[var(--xotic-tablet-list-w)] flex-shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden">
          {/* Sticky stack: topbar + search + tabs */}
          <div className="sticky top-0 z-10 bg-surface">
            <div className="h-[var(--xotic-topbar-h)] border-b border-border bg-surface-muted" />
            <MobileSearch />
            <MobileTabs />
            <div className="border-b border-border" />
          </div>

          {/* Scrollable list body */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-1">
              {/* Archived row (box only) */}
              <div className="px-[var(--xotic-pad-4)] py-[var(--xotic-pad-3)]">
                <div
                  aria-label="Archived"
                  className="h-12 w-full rounded-[var(--xotic-radius-sm)] bg-background border border-border"
                />
              </div>

              {chats.map((c) => (
                <TabletChatRow
                  key={c.id}
                  active={c.id === activeId}
                  onSelect={() =>
                    setActiveId((prev) => (prev === c.id ? null : c.id))
                  }
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Right: chat pane */}
        <main className="flex-1 flex flex-col bg-background overflow-hidden relative">
          {activeId === null ? (
            <ChatEmptyState variant="tablet" />
          ) : (
            <>
              {/* sticky header */}
              <div className="sticky top-0 z-10 bg-background">
                <div className="h-1 w-full bg-surface-muted border-b border-border" />
                <MobileChatHeader
                  onToggleDetails={() => setDetailsOpen((v) => !v)}
                  detailsOpen={detailsOpen}
                />
              </div>

              {/* messages */}
              <div className="flex-1 overflow-hidden p-[var(--xotic-pad-4)] bg-background relative">
                <MessagesSurface />

                {/* details drawer overlay */}
                <TabletDetailsDrawer
                  open={detailsOpen}
                  onClose={() => setDetailsOpen(false)}
                  onOpenFullScreen={() => {
                    setDetailsOpen(false);
                    setDetailsFullOpen(true);
                  }}
                />
              </div>

              {/* sticky composer */}
              <div className="sticky bottom-0 z-10 bg-background">
                <MobileComposer />
              </div>
            </>
          )}

          <DetailsFullScreenOverlay
            open={detailsFullOpen}
            onClose={() => setDetailsFullOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}
