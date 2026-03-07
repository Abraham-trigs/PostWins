// app/components/details/DetailsPanelSelected.tsx
// Purpose: Authoritative case details panel (data-driven) with beneficiary + staff integration and accessible tab structure.

"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Maximize2 } from "lucide-react";
import { getCaseDetails } from "@/lib/api/contracts/domain/cases.api";
import type { CaseDetailsResponse } from "@/lib/api/contracts/domain/cases.api";
import { ExplainCasePanel } from "../chat/explain/ExplainCasePanel";

////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////

type Props = {
  caseId: string;
  onOpenFullScreen?: () => void;
};

type TabKey = "overview" | "explain";

////////////////////////////////////////////////////////////
// Component
////////////////////////////////////////////////////////////

export function DetailsPanelSelected({ caseId, onOpenFullScreen }: Props) {
  const [data, setData] = useState<CaseDetailsResponse["case"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  const controllerRef = useRef<AbortController | null>(null);
  const tabsId = useId();
  const panelId = `${tabsId}-panel-${tab}`;

  const isDraft = caseId.startsWith("draft_");

  ////////////////////////////////////////////////////////////
  // Fetch logic (abort-safe + Draft Gated)
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    // GATE: If no ID or it's a UI-only draft, reset state and exit.
    // This stops the 400 Bad Request for non-persisted UUIDs.
    if (!caseId || caseId.startsWith("draft_")) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    getCaseDetails(caseId, { signal: controller.signal })
      .then((res) => {
        setData(res.case);
      })
      .catch((err: any) => {
        if (err?.name === "AbortError") return;
        setError("Failed to load case details.");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [caseId]);

  ////////////////////////////////////////////////////////////
  // Derived
  ////////////////////////////////////////////////////////////

  const lifecycleLabel = useMemo(() => {
    if (!data) return null;
    return `${data.lifecycle} • ${data.status}`;
  }, [data]);

  ////////////////////////////////////////////////////////////
  // Render
  ////////////////////////////////////////////////////////////

  return (
    <div className="h-full w-full p-4 overflow-hidden">
      <div className="h-full w-full rounded-[var(--xotic-radius)] border border-line/50 bg-paper flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex-shrink-0 border-b border-line/50 bg-paper p-4">
          {loading && !isDraft && (
            <div className="text-sm text-ink/60">Loading…</div>
          )}

          {error && <div className="text-sm text-red-500">{error}</div>}

          {isDraft && (
            <div className="flex items-center gap-4 animate-in fade-in duration-500">
              <div className="h-12 w-12 rounded-full bg-surface-muted border border-line/20 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-surface-muted rounded animate-pulse" />
                <div className="text-xs text-ink/40 italic">
                  Initializing project...
                </div>
              </div>
            </div>
          )}

          {!loading && !error && data && !isDraft && (
            <div className="flex items-center gap-4">
              <Avatar initials={data.referenceCode.slice(0, 2)} />

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">
                  {data.referenceCode}
                </div>
                <div className="text-xs text-ink/60">{lifecycleLabel}</div>
              </div>

              {onOpenFullScreen && (
                <button
                  type="button"
                  aria-label="Open details in full screen"
                  onClick={onOpenFullScreen}
                  className="h-10 w-10 rounded-lg border border-line/50 bg-surface-muted hover:bg-surface-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring grid place-items-center"
                >
                  <Maximize2 className="h-4 w-4 text-ocean" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* TABS (Hidden for drafts) */}
        {!isDraft && (
          <div className="px-4 pt-3">
            <div
              role="tablist"
              aria-label="Details sections"
              className="flex gap-2 border-b border-line/50 pb-2"
            >
              {(["overview", "explain"] as TabKey[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  aria-controls={`${tabsId}-panel-${t}`}
                  id={`${tabsId}-tab-${t}`}
                  onClick={() => setTab(t)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    tab === t
                      ? "bg-surface border border-line/50"
                      : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BODY */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-6"
          role="tabpanel"
          id={panelId}
          aria-labelledby={`${tabsId}-tab-${tab}`}
        >
          {isDraft && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
              <div className="text-sm font-medium text-ink/70 uppercase tracking-widest text-[10px]">
                Project Draft
              </div>
              <p className="text-sm text-ink/50 max-w-[220px] leading-relaxed">
                Complete the questionnaire to generate sovereign ledger insights
                and case mapping.
              </p>
            </div>
          )}

          {!loading && !error && data && !isDraft && tab === "overview" && (
            <>
              <Section title="Summary">
                <p className="text-sm text-ink/80">
                  {data.summary ?? "No summary provided."}
                </p>
              </Section>

              <Section title="SDG Goal">
                <p className="text-sm">{data.sdgGoal ?? "N/A"}</p>
              </Section>

              <Section title="Current Task">
                <p className="text-sm">
                  {data.currentTask?.label ?? "Not started"}{" "}
                </p>
              </Section>

              <Section title="Beneficiary">
                {data.beneficiary ? (
                  <div className="text-sm space-y-1">
                    <div>ID: {data.beneficiary.id}</div>
                    {data.beneficiary.pii && (
                      <>
                        <div>Phone: {data.beneficiary.pii.phone ?? "—"}</div>
                        <div>
                          Address: {data.beneficiary.pii.address ?? "—"}
                        </div>
                        <div>
                          DOB: {data.beneficiary.pii.dateOfBirth ?? "—"}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-ink/60">Unlinked</div>
                )}
              </Section>

              <Section title="Assigned Staff">
                {data.assignedStaff ? (
                  <div className="text-sm space-y-1">
                    <div>{data.assignedStaff.name ?? "Unnamed"}</div>
                    <div>{data.assignedStaff.email ?? "—"}</div>
                  </div>
                ) : (
                  <div className="text-sm text-ink/60">Unassigned</div>
                )}
              </Section>
            </>
          )}

          {!isDraft && tab === "explain" && (
            <ExplainCasePanel caseId={caseId} />
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-line/50 bg-surface p-4">
      <div className="text-xs uppercase tracking-wide text-ink/60 mb-2">
        {title}
      </div>
      {children}
    </section>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="h-12 w-12 rounded-full bg-surface-muted border border-line/50 grid place-items-center text-xs font-semibold">
      {initials}
    </div>
  );
}

////////////////////////////////////////////////////////////
// Design reasoning
////////////////////////////////////////////////////////////
// - Gated execution: Prevents backend 400 errors by identifying
//   'draft_' identifiers before triggering fetchers.
// - Authoritative Projection: Strictly follows CaseDetailsResponse
//   mapping to ensure UI matches the Sovereign Ledger state.
// - Abort-safe: Prevents state leaks and race conditions on
//   rapid case switching.
// - Transition UX: Provides a placeholder "Draft" state while
//   the project is being born in the intake questionnaire.

////////////////////////////////////////////////////////////
// Structure
////////////////////////////////////////////////////////////
// - Fetch + Gating logic
// - Draft-aware Header (Pulse loading states)
// - Tabs (Gated for persisted cases only)
// - Overview projection
// - Explain panel passthrough

////////////////////////////////////////////////////////////
// Implementation guidance
////////////////////////////////////////////////////////////
// Parent usage:
// <DetailsPanelSelected caseId={selectedCaseId} />
//
// NOTE: Component handles local UI 'draft_uuid' vs backend
// 'uuid' automatically. Re-fetch is triggered only when
// caseId transitions to a valid persisted UUID.

////////////////////////////////////////////////////////////
// Scalability insight
////////////////////////////////////////////////////////////
// - Lazy Load: Future heavy modules (Audit Trail, Evidence)
//   should use 'isDraft' to delay initialization.
// - Multi-query: Transition to ?include= parameters for
//   large-tenant scenarios to avoid payload bloat.
////////////////////////////////////////////////////////////
