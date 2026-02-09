"use client";

import { useEffect, useState } from "react";
import { explainApi } from "@/lib/api/explain.api";

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

type Decision = {
  decisionId: string;
  decisionType: string;
  decidedAt: string;
  actorKind: string;
  actorUserId?: string;
  reason?: string;
  authoritative: boolean;
};

export function AuthoritativeDecisions({ caseId }: Props) {
  return (
    <SectionCard title="Authoritative Decisions">
      <div className="space-y-4">
        {DECISION_TYPES.map((type) => (
          <DecisionSlot key={type} caseId={caseId} decisionType={type} />
        ))}
      </div>
    </SectionCard>
  );
}

/* ---------- per-decision card ---------- */

function DecisionSlot({
  caseId,
  decisionType,
}: {
  caseId: string;
  decisionType: string;
}) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    explainApi
      .authoritativeDecision(caseId, decisionType)
      .then((res) => setDecision(res?.decision ?? null))
      .catch(() => setError(true));
  }, [caseId, decisionType]);

  return (
    <div className="rounded border border-line/50 bg-paper p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold">{decisionType}</div>
        {decision && (
          <span className="text-[10px] rounded bg-green-100 px-2 py-0.5 text-green-700">
            Authoritative
          </span>
        )}
      </div>

      {error && <div className="text-xs text-ink/60">Failed to load</div>}

      {!error && !decision && (
        <div className="text-xs text-ink/60">No authoritative decision</div>
      )}

      {decision && (
        <div className="space-y-1 text-xs">
          <KeyValue
            label="Decided At"
            value={new Date(decision.decidedAt).toLocaleString()}
          />
          <KeyValue
            label="Actor"
            value={decision.actorUserId ?? decision.actorKind}
          />
          {decision.reason && (
            <KeyValue label="Reason" value={decision.reason} />
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- boring UI helpers ---------- */

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-line/50 bg-surface p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/55">
        {title}
      </div>
      {children}
    </section>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ink/60">{label}</span>
      <span className="font-mono text-right">{value}</span>
    </div>
  );
}
