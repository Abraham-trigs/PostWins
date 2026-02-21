"use client";

import React, { useEffect, useState } from "react";
import { MobileTopBar } from "./MobileTopBar";
import { MobileSearch } from "./MobileSearch";
import { MobileTabs } from "./MobileTabs";
import { MobileChatRow } from "./MobileChatRow";
import { listCases, type CaseListItem } from "@/lib/api/cases.api";

export function MobileChatsScreen() {
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const result = await listCases();
        setCases(result.cases);
      } catch (err) {
        console.error("Failed to load workflow chats", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="h-full w-full bg-background flex flex-col">
      <MobileTopBar />
      <MobileSearch />
      <MobileTabs />

      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full overflow-y-auto scrollbar-none">
          <div className="py-1">
            {/* Archived Placeholder */}
            <div className="px-[var(--xotic-pad-4)] py-[var(--xotic-pad-3)]">
              <div className="h-12 w-full rounded-[var(--xotic-radius-sm)] bg-surface border border-border" />
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-ink/30 animate-pulse uppercase tracking-widest">
                Syncing Workflow...
              </div>
            ) : (
              cases.map((caseItem) => (
                <MobileChatRow
                  key={caseItem.id}
                  caseItem={caseItem}
                  href={`/xotic/postwins/chat/${caseItem.id}`}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <nav className="h-16 flex-shrink-0 border-t border-border bg-surface" />
    </div>
  );
}
