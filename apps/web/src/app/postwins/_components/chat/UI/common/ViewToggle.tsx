"use client";

import { usePostWinStore } from "../../store/usePostWinStore";
import type { FeedView } from "../../store/usePostWinStore";

const VIEWS: { id: FeedView; label: string }[] = [
  { id: "all", label: "All" },
  { id: "record", label: "Discussion" },
  { id: "delivery", label: "Evidence" },
  { id: "verify", label: "Verify" },
  { id: "followup", label: "Follow Up" },
];

export function ViewToggle() {
  const activeView = usePostWinStore((s) => s.activeView);
  const setActiveView = usePostWinStore((s) => s.setActiveView);

  // 🔔 Pull activity state from the store
  const viewActivity = usePostWinStore((s) => s.viewActivity);

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-strong/50 border border-line/40 rounded-full w-fit mx-auto mb-6">
      {VIEWS.map((v) => {
        // 🛡️ SAFE CHECK: Ensure viewActivity exists before accessing keys
        // Logic: Only show dots on tabs that are NOT 'all' and NOT currently active
        const hasActivity =
          v.id !== "all" &&
          viewActivity &&
          viewActivity[v.id as keyof typeof viewActivity];

        const isActive = activeView === v.id;

        return (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`relative px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all
              ${
                isActive
                  ? "bg-paper text-ink shadow-sm border border-line/20"
                  : "text-ink/40 hover:text-ink/70"
              }`}
          >
            {v.label}

            {/* 🔴 ACTIVITY INDICATOR (The "Signal" Dot) */}
            {hasActivity && !isActive && (
              <span className="absolute -top-1 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ocean/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ocean border border-paper"></span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
