"use client";

import { useEffect, useState } from "react";
import { explainApi } from "@/lib/api/explain.api";

type Props = {
  caseId: string;
};

type Decision = {
  decisionId: string;
  decisionType: string;
  decidedAt: string;
  supersededAt?: string;
  actorKind: string;
  actorUserId?: string;
  reason?: string;
};

const DECISION_TYPES = [
  "ROUTING",
  "VERIFICATION",
  "FLAGGING",
  "APPEAL",
  "BUDGET",
  "TRANCHE",
] as const;

export function DecisionHistory({ caseId }: Props) {
  return (
    <SectionCard title="Decision History">
      <div className="space-y-6">
        {DECISION_TYPES.map((type) => (
          <DecisionHistoryGroup
            key={type}
            caseId={caseId}
            decisionType={type}
          />
        ))}
      </div>
    </SectionCard>
  );
}

/* ---------- per-type history ---------- */

function DecisionHistoryGroup({
  caseId,
  decisionType,
}: {
  caseId: string;
  decisionType: string;
}) {
  const [items, setItems] = useState<Decision[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    explainApi
      .decisionHistory(caseId, decisionType)
      .then((res) => setItems(res?.history ?? []))
      .catch(() => setError(true));
  }, [caseId, decisionType]);

  if (error) {
    return (
      <div className="text-xs text-ink/60">
        Failed to load {decisionType} history
      </div>
    );
  }

  if (items.length === 0) {
    return null; // no noise for unused decision types
  }

  return (
    <div>
      <div className="mb-2 text-xs font-semibold">{decisionType}</div>

      <div className="space-y-2">
        {items.map((d) => (
          <DecisionRow key={d.decisionId} decision={d} />
        ))}
      </div>
    </div>
  );
}

/* ---------- row ---------- */

function DecisionRow({ decision }: { decision: Decision }) {
  return (
    <div className="rounded border border-line/50 bg-paper p-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="font-mono">
          {new Date(decision.decidedAt).toLocaleString()}
        </div>

        {decision.supersededAt && (
          <span className="rounded bg-yellow-100 px-2 py-0.5 text-[10px] text-yellow-700">
            Superseded
          </span>
        )}
      </div>

      <div className="mt-1 text-ink/70">
        Actor: {decision.actorUserId ?? decision.actorKind}
      </div>

      {decision.reason && (
        <div className="mt-1 text-ink/70">Reason: {decision.reason}</div>
      )}
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
    <section className="rounded border border-line/50 bg-surface p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/55">
        {title}
      </div>
      {children}
    </section>
  );
}
