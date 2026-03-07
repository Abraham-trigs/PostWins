"use client";

import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { LeftRail } from "../navigation/LeftRail";
import { ChatHeader } from "../chat/UI/common/ChatHeader";
import { Composer } from "@ui/chat/composer/ui/Composer";
import { DetailsPanel } from "../details/DetailsPanel";
import { DesktopChatList } from "./DesktopChatList";
import { ChatEmptyState } from "../chat/UI/common/ChatEmptyState";
import { DetailsEmptyState } from "../details/DetailsEmptyState";
import { MessagesSurface } from "../chat/UI/common/MessagesSurface";
import { DetailsFullScreenOverlay } from "../details/DetailsFullScreenOverlay";

import { usePostWinStore } from "../chat/store/usePostWinStore";
import { usePostWinListStore } from "../chat/store/usePostWinListStore";

import { wsService } from "@/services/websocket.service";
import { useAuthStore } from "@/lib/store/useAuthStore";

async function fetchTimeline(projectId: string) {
  const res = await fetch(`/api/timeline/${projectId}`, {
    method: "GET",
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to load timeline");
  return data;
}

export function DesktopShell() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detailsFullOpen, setDetailsFullOpen] = useState(false);

  /* ================= Auth (Stabilized) ================= */
  const { userId, tenantId, isAuthenticated, isHydrated } = useAuthStore(
    useShallow((s) => ({
      userId: s.user?.id,
      tenantId: s.tenantId,
      isAuthenticated: s.isAuthenticated,
      isHydrated: s.isHydrated,
    })),
  );

  /* ================= Store Actions ================= */
  const fetchMessages = usePostWinStore((s) => s.fetchMessages);
  const setTimeline = usePostWinStore((s) => s.setTimeline);
  const setTimelineLoading = usePostWinStore((s) => s.setTimelineLoading);
  const attachIds = usePostWinStore((s) => s.attachIds);

  const initializeList = usePostWinListStore((s) => s.initialize);
  const selectList = usePostWinListStore((s) => s.select);

  /* ================= Initialize List ================= */
  useEffect(() => {
    if (!isHydrated || !tenantId) return;
    initializeList(tenantId);
  }, [initializeList, tenantId, isHydrated]);

  /* ================= WebSocket Lifecycle (Gated) ================= */
  useEffect(() => {
    // GATE: Do not connect if no ID or if it's a UI-only draft
    const isDraft = activeId?.startsWith("draft_");

    if (
      !activeId ||
      isDraft ||
      !isHydrated ||
      !isAuthenticated ||
      !userId ||
      !tenantId
    ) {
      return;
    }

    wsService.connect(activeId);
    return () => wsService.disconnect();
  }, [activeId, isHydrated, isAuthenticated, userId, tenantId]);

  /* ================= Chat + Timeline Loader (Gated) ================= */
  useEffect(() => {
    if (!activeId) {
      attachIds({ projectId: null, postWinId: null });
      return;
    }

    if (!isHydrated || !tenantId || !isAuthenticated) return;

    let mounted = true;

    const loadData = async () => {
      const isDraft = activeId.startsWith("draft_");

      // Sync store state with selection
      attachIds({ projectId: activeId, postWinId: null });

      // GATE: Skip API calls for local drafts
      if (isDraft) {
        setTimeline([]);
        setTimelineLoading(false);
        return;
      }

      try {
        setTimelineLoading(true);
        const [msgResult, timelineResult] = await Promise.allSettled([
          fetchMessages(activeId),
          fetchTimeline(activeId),
        ]);

        if (!mounted) return;

        if (timelineResult.status === "fulfilled") {
          setTimeline(timelineResult.value.timeline);
        }
        setTimelineLoading(false);
      } catch (error) {
        if (mounted) setTimelineLoading(false);
        console.error("Critical load failure:", error);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [
    activeId,
    isHydrated,
    tenantId,
    isAuthenticated,
    fetchMessages,
    setTimeline,
    setTimelineLoading,
    attachIds,
  ]);

  /* ================= ESC Handling ================= */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (detailsFullOpen) setDetailsFullOpen(false);
      else setActiveId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detailsFullOpen]);

  if (!isHydrated) return null;

  return (
    <div className="h-[100vh] w-full p-[var(--xotic-pad-6)] bg-[#abc7bb] overflow-hidden">
      <div className="h-[880px] -mt-2 w-full rounded-[var(--xotic-radius-lg)] bg-paper flex overflow-hidden border border-line/40">
        <LeftRail />

        <div className="bg-surface border-r border-line/40">
          <DesktopChatList
            activeId={activeId}
            onSelect={(id) => {
              const nextId = activeId === id ? null : id;
              setActiveId(nextId);
              if (nextId) selectList(nextId);
            }}
          />
        </div>

        <main className="flex-1 flex flex-col bg-paper relative">
          <ChatHeader />
          <section className="flex-1 overflow-hidden p-[var(--xotic-pad-6)]">
            {activeId === null ? (
              <div className="h-full w-full rounded-[var(--xotic-radius)] border border-line/40 bg-surface overflow-hidden">
                <ChatEmptyState
                  variant="desktop"
                  onPrimaryAction={() => {
                    const draftId = `draft_${crypto.randomUUID()}`;
                    setActiveId(draftId);
                    usePostWinStore.getState().setComposerMode("record");
                  }}
                />
              </div>
            ) : (
              <div className="h-full w-full rounded-[var(--xotic-radius)] bg-surface-strong border border-line/40 overflow-hidden">
                <MessagesSurface />
              </div>
            )}
          </section>
          <Composer />
        </main>

        <div className="w-[var(--xotic-details-w)] flex-shrink-0 border-l border-line/40 bg-paper">
          {activeId === null ? (
            <DetailsEmptyState />
          ) : (
            <DetailsPanel
              caseId={activeId}
              onOpenFullScreen={() => setDetailsFullOpen(true)}
            />
          )}
        </div>

        <DetailsFullScreenOverlay
          open={detailsFullOpen}
          caseId={activeId ?? ""}
          onClose={() => setDetailsFullOpen(false)}
        />
      </div>
    </div>
  );
}
