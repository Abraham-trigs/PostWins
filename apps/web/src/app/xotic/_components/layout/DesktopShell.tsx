// apps/web/src/app/xotic/_components/layout/DesktopShell.tsx
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

import { usePostWinStore } from "../chat/store/usePostWinStore";
import type { ChatMessage } from "../chat/store/types";

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * Dev tenant resolution:
 * 1) NEXT_PUBLIC_TENANT_ID
 * 2) localStorage posta.tenantId
 *
 * NOTE: In production, tenantId should come from auth/session.
 */
function getTenantId(): string {
  const envTenant =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_TENANT_ID ?? "")
      : "";

  if (envTenant && envTenant.trim()) return envTenant.trim();

  if (typeof window !== "undefined") {
    const ls = window.localStorage.getItem("posta.tenantId");
    if (ls && ls.trim()) return ls.trim();
  }

  throw new Error(
    "Missing tenantId. Set NEXT_PUBLIC_TENANT_ID or localStorage posta.tenantId",
  );
}

type TimelineResponse = {
  ok: true;
  projectId: string;
  timeline: Array<
    | {
        type: "delivery";
        occurredAt: string;
        deliveryId: string;
        summary: string;
      }
    | {
        type: "followup";
        occurredAt: string;
        followupId: string;
        kind: string;
        deliveryId: string;
      }
    | {
        type: "gap";
        scheduledFor: string;
        deliveryId: string;
        label: string;
        status: "missing" | "upcoming";
        daysFromDelivery: number;
      }
  >;
  counts?: any;
};

function timelineToMessages(t: TimelineResponse): ChatMessage[] {
  const out: ChatMessage[] = [];

  out.push({
    id: uid("m"),
    kind: "text",
    role: "system",
    mode: "verify",
    text: `Loaded case timeline • ${t.projectId.slice(0, 8)}`,
    createdAt: nowIso(),
  });

  for (const item of t.timeline ?? []) {
    if (item.type === "delivery") {
      out.push({
        id: uid("e"),
        kind: "event",
        title: "Delivery recorded",
        meta: item.summary || `Delivery ${item.deliveryId}`,
        status: "logged",
        createdAt: item.occurredAt,
      });
      continue;
    }

    if (item.type === "followup") {
      out.push({
        id: uid("e"),
        kind: "event",
        title: `Follow-up • ${item.kind}`,
        meta: `deliveryId: ${item.deliveryId}`,
        status: "logged",
        createdAt: item.occurredAt,
      });
      continue;
    }

    // gap
    out.push({
      id: uid("e"),
      kind: "event",
      title:
        item.status === "missing" ? "Follow-up missing" : "Follow-up scheduled",
      meta: `${item.label} • ${new Date(item.scheduledFor).toLocaleString()} • deliveryId: ${item.deliveryId}`,
      status: item.status === "missing" ? "failed" : "pending",
      createdAt: item.scheduledFor,
    });
  }

  return out;
}

async function fetchTimeline(projectId: string): Promise<TimelineResponse> {
  const tenantId = getTenantId();

  const res = await fetch(`/api/timeline/${projectId}`, {
    method: "GET",
    headers: {
      "X-Tenant-Id": tenantId,
    },
    cache: "no-store",
  });

  const data = (await res.json()) as any;

  if (!res.ok) {
    throw new Error(data?.error || "Failed to load timeline");
  }

  return data as TimelineResponse;
}

export function DesktopShell() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detailsFullOpen, setDetailsFullOpen] = useState(false);

  // Messages live in zustand
  const messages = usePostWinStore((s) => s.messages);

  // Only need attachIds here (do NOT hard reset while selecting a case)
  const attachIds = usePostWinStore((s) => s.attachIds);

  // Auto-select newly bootstrapped projectId
  const storeProjectId = usePostWinStore((s) => s.ids.projectId);
  useEffect(() => {
    if (storeProjectId && storeProjectId !== activeId) {
      setActiveId(storeProjectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeProjectId]);

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

  // When a case is selected, load its timeline into the store
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!activeId) return;

      try {
        // ✅ Keep ids stable; only attach + clear messages
        attachIds({ projectId: activeId, postWinId: null });

        usePostWinStore.setState(
          {
            messages: [
              {
                id: uid("m"),
                kind: "text",
                role: "system",
                mode: "verify",
                text: "Loading timeline…",
                createdAt: nowIso(),
              },
            ],
          },
          false,
          "timeline:loading",
        );

        const t = await fetchTimeline(activeId);
        if (!mounted) return;

        const next = timelineToMessages(t);
        usePostWinStore.setState({ messages: next }, false, "timeline:loaded");
      } catch (e) {
        if (!mounted) return;

        usePostWinStore.setState(
          {
            messages: [
              {
                id: uid("m"),
                kind: "text",
                role: "system",
                mode: "verify",
                text:
                  e instanceof Error
                    ? `Failed to load timeline: ${e.message}`
                    : "Failed to load timeline.",
                createdAt: nowIso(),
              },
            ],
          },
          false,
          "timeline:error",
        );
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeId, attachIds]);

  return (
    <div className="h-full w-full p-[var(--xotic-pad-6)] bg-[#abc7bb]">
      <div
        className="
          h-screen w-full
          rounded-[var(--xotic-radius-lg)]
          bg-paper
          flex
          overflow-hidden
          border border-line/40
        "
      >
        <LeftRail />

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
              <div className="h-full w-full rounded-[var(--xotic-radius)] border border-line/40 bg-surface overflow-hidden">
                <ChatEmptyState variant="desktop" />
              </div>
            ) : (
              <div className="h-full w-full rounded-[var(--xotic-radius)] bg-surface-strong border border-line/40 overflow-hidden">
                <MessagesSurface messages={messages} />
              </div>
            )}
          </section>

          <Composer />
        </main>

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
