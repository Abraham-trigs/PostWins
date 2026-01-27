"use client";

import { useEffect, useState } from "react";
import { LeftRail } from "../navigation/LeftRail";
import { ChatHeader } from "../chat/ChatHeader";
import { Composer } from "../chat/composer/Composer";
import { DetailsPanel } from "../details/DetailsPanel";
import { DesktopChatList } from "../layout/DesktopChatList";
import { ChatEmptyState } from "../chat/ChatEmptyState";
import { DetailsEmptyState } from "../details/DetailsEmptyState";
import { MessagesSurface } from "../chat/MessagesSurface";
import { DetailsFullScreenOverlay } from "../details/DetailsFullScreenOverlay";

export function DesktopShell() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [detailsFullOpen, setDetailsFullOpen] = useState(false);

  useEffect(() => {
    if (activeId === null) setDetailsFullOpen(false);
  }, [activeId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (detailsFullOpen) setDetailsFullOpen(false);
      else setActiveId(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detailsFullOpen]);

  return (
    /* Outer background using color-one */
    <div className="h-full w-full p-[var(--xotic-pad-6)] bg-[#abc7bb]">
      <div
        className="
          h-full w-full
          rounded-[var(--xotic-radius-lg)]
          bg-paper
          flex
          overflow-hidden
          border border-line/40
        "
      >
        <LeftRail />

        {/* List area: Separated by color-three tint */}
        <div className="bg-surface border-r border-line/40">
          <DesktopChatList
            activeId={activeId}
            onSelect={(id) => setActiveId((prev) => (prev === id ? null : id))}
          />
        </div>

        <main
          aria-label="Chat main"
          className="flex-1 flex flex-col bg-paper relative"
        >
          <ChatHeader />

          <section
            aria-label="Chat content"
            className="flex-1 overflow-hidden p-[var(--xotic-pad-6)]"
          >
            {activeId === null ? (
              /* Empty state: Using color-three for the 'hollow' container */
              <div className="h-full w-full rounded-[var(--xotic-radius)] border border-line/40 bg-surface overflow-hidden">
                <ChatEmptyState variant="desktop" />
              </div>
            ) : (
              /* Active Surface: Solid color-three for high-contrast focus area */
              <div className="h-full w-full rounded-[var(--xotic-radius)] bg-surface-strong border border-line/40 overflow-hidden">
                <MessagesSurface />
              </div>
            )}
          </section>

          <Composer />
        </main>

        {/* Details: Solid block using color-one with subtle line separation */}
        <div className="w-[var(--xotic-details-w)] flex-shrink-0 border-l border-line/40 bg-paper">
          {activeId === null ? (
            <DetailsEmptyState />
          ) : (
            <DetailsPanel onOpenFullScreen={() => setDetailsFullOpen(true)} />
          )}
        </div>

        <DetailsFullScreenOverlay
          open={detailsFullOpen}
          onClose={() => setDetailsFullOpen(false)}
        />
      </div>
    </div>
  );
}
