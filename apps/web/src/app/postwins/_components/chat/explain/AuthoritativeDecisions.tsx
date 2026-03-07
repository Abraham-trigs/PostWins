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
  actorKind: string;
  actorUserId?: string;
  reason?: string;
  authoritative: boolean;
};

export function AuthoritativeDecisions({ caseId }: Props) {
  const isDraft = caseId.startsWith("draft_");

  return (
    <SectionCard title="Authoritative Decisions">
      <div className="space-y-4">
        {/* If it's a draft, we show a single unified placeholder instead of 6 empty slots */}
        {isDraft ? (
          <div className="p-4 rounded border border-dashed border-line/40 text-center">
            <p className="text-xs text-ink/40 italic">
              Decisions will be projected once project is committed to ledger.
            </p>
          </div>
        ) : (
          DECISION_TYPES.map((type) => (
            <DecisionSlot key={type} caseId={caseId} decisionType={type} />
          ))
        )}
      </div>
    </SectionCard>
  );
}

/* ---------- per-decision card (Gated) ---------- */

function DecisionSlot({
  caseId,
  decisionType,
}: {
  caseId: string;
  decisionType: DecisionTypeConst;
}) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // GATE: Double-check gate here to prevent accidental execution
    if (!caseId || caseId.startsWith("draft_")) return;

    setLoading(true);
    setError(false);

    explainApi
      .authoritativeDecision(caseId, decisionType)
      .then((res) => setDecision(res?.decision ?? null))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [caseId, decisionType]);

  return (
    <div className="rounded border border-line/50 bg-paper p-3 transition-opacity">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider font-bold text-ink/40">
          {decisionType}
        </div>
        {decision && (
          <span className="text-[10px] font-bold rounded bg-green-100 dark:bg-green-500/10 px-2 py-0.5 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">
            Authoritative
          </span>
        )}
      </div>

      {loading && (
        <div className="text-[10px] text-ink/30 animate-pulse">
          Scanning ledger...
        </div>
      )}

      {error && <div className="text-xs text-red-400/80">Sync error</div>}

      {!loading && !error && !decision && (
        <div className="text-[10px] text-ink/40 italic">
          Pending determination
        </div>
      )}

      {decision && (
        <div className="space-y-1.5 text-xs mt-2 pt-2 border-t border-line/30">
          <KeyValue
            label="Decided At"
            value={new Date(decision.decidedAt).toLocaleString()}
          />
          <KeyValue
            label="Actor"
            value={decision.actorUserId ?? decision.actorKind}
          />
          {decision.reason && (
            <div className="mt-1 bg-surface-muted/50 p-2 rounded text-[11px] text-ink/70 italic border-l-2 border-line/50">
              "{decision.reason}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- UI helpers ---------- */

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

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-[11px]">
      <span className="text-ink/50 uppercase tracking-tight">{label}</span>
      <span className="font-mono text-ink/80 text-right truncate max-w-[140px]">
        {value}
      </span>
    </div>
  );
}
