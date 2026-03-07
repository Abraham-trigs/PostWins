"use client";

import { useEffect, useState } from "react";
import { explainApi } from "@/lib/api/contracts/domain/explain.api";

type Props = {
  caseId: string;
};

const DECISION_TYPES = [
  "ROUTING",
  "VERIFICATION",
  "FLAGGING",
  "APPEAL",
  "BUDGET",
  "TRANCHE",
] as const;

type DecisionTypeConst = (typeof DECISION_TYPES)[number];

type Decision = {
  decisionId: string;
  decisionType: DecisionTypeConst;
  decidedAt: string;
  supersededAt?: string;
  actorKind: string;
  actorUserId?: string;
  reason?: string;
};

export function DecisionHistory({ caseId }: Props) {
  const isDraft = caseId.startsWith("draft_");

  return (
    <SectionCard title="Decision History">
      {isDraft ? (
        <div className="py-8 text-center border border-dashed border-line/30 rounded-lg">
          <p className="text-[10px] uppercase tracking-widest text-ink/30 font-bold mb-1">
            Archive Locked
          </p>
          <p className="text-xs text-ink/40 italic">
            History will populate after initial bootstrap.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {DECISION_TYPES.map((type) => (
            <DecisionHistoryGroup
              key={type}
              caseId={caseId}
              decisionType={type}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ---------- per-type history (Gated) ---------- */

function DecisionHistoryGroup({
  caseId,
  decisionType,
}: {
  caseId: string;
  decisionType: DecisionTypeConst;
}) {
  const [items, setItems] = useState<Decision[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // GATE: Prevent fetching for draft IDs
    if (!caseId || caseId.startsWith("draft_")) return;

    setLoading(true);
    setError(false);

    explainApi
      .decisionHistory(caseId, decisionType)
      .then((res) => setItems(res?.history ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [caseId, decisionType]);

  if (error) {
    return (
      <div className="text-[10px] text-red-400/60 uppercase tracking-tight font-medium">
        Sync Error: {decisionType}
      </div>
    );
  }

  // Hide empty groups to keep the UI clean
  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ink/40 border-b border-line/20 pb-1">
        {decisionType}
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="h-12 w-full bg-paper/50 rounded animate-pulse border border-line/10" />
        ) : (
          items.map((d) => <DecisionRow key={d.decisionId} decision={d} />)
        )}
      </div>
    </div>
  );
}

/* ---------- row ---------- */

function DecisionRow({ decision }: { decision: Decision }) {
  return (
    <div className="group relative rounded-lg border border-line/40 bg-paper p-3 text-xs transition-hover hover:border-line/60">
      <div className="flex items-center justify-between mb-2">
        <div className="font-mono text-[10px] text-ink/50 bg-surface px-2 py-0.5 rounded">
          {new Date(decision.decidedAt).toLocaleString()}
        </div>

        {decision.supersededAt && (
          <span className="rounded-full bg-orange-100 dark:bg-orange-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
            Superseded
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-ink/80">
          <span className="text-[10px] text-ink/30 uppercase font-bold tracking-tight">
            Actor
          </span>
          <span className="font-mono truncate">
            {decision.actorUserId ?? decision.actorKind}
          </span>
        </div>

        {decision.reason && (
          <div className="mt-2 text-ink/60 bg-surface-muted/30 p-2 rounded italic text-[11px] border-l border-line/50">
            "{decision.reason}"
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- shared shell ---------- */

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line/50 bg-surface p-5 shadow-sm">
      <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-ink/40">
        {title}
      </div>
      {children}
    </section>
  );
}
