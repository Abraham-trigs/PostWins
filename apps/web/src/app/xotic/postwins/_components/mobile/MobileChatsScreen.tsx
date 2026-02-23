// app/components/mobile/MobileChatsScreen.tsx
// Purpose: Mobile-first chat listing screen that loads workflow cases with proper auth error handling and no client-side localStorage guards.

"use client";

import React, { useEffect, useState } from "react";
import { MobileTopBar } from "./MobileTopBar";
import { MobileSearch } from "./MobileSearch";
import { MobileTabs } from "./MobileTabs";
import { MobileChatRow } from "./MobileChatRow";
import {
  listCases,
  type CaseListItem,
} from "@/lib/api/contracts/domain/cases.api";

/**
 * Design reasoning:
 * - Server is the source of truth for auth. We do NOT gate by localStorage.
 * - If session is invalid, API should return 401 and we handle gracefully.
 * - UI remains predictable: loading → empty → data.
 * * No client-side tenant assumptions.
 *
 * Structure:
 * - MobileChatsScreen (default export component)
 * - Local state: cases, loading
 * - useEffect → load() with proper try/catch/finally
 *
 * Implementation guidance:
 * - Assumes listCases() throws an error with `status` when non-200.
 * - If using fetch wrapper, ensure it throws structured errors.
 *
 * Scalability insight:
 * - Future enhancement: move loading + cases into a dedicated Zustand store
 *   to prevent refetching when navigating between mobile views.
 */

export function MobileChatsScreen() {
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // Server handles session validation
        const result = await listCases();

        // Defensive fallback
        setCases(result?.cases || []);
      } catch (err: any) {
        // Explicit 401 handling
        if (err?.status === 401) {
          console.warn("Unauthorized – session missing.");
        } else {
          console.error("Failed to load workflow chats", err);
        }
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
            ) : cases.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink/40">
                No active cases found.
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
