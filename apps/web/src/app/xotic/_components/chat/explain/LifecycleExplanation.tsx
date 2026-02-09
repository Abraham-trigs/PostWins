"use client";

import { useEffect, useState } from "react";
import { explainApi } from "@/lib/api/explain.api";

type Props = {
  caseId: string;
};

type LifecycleExplanationResponse = {
  lifecycle: string;
  causedByDecision: {
    decisionType: string;
    decidedAt: string;
    actorKind: string;
    actorUserId?: string;
    reason?: string;
  } | null;
};

export function LifecycleExplanation({ caseId }: Props) {
  const [data, setData] = useState<LifecycleExplanationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    explainApi
      .lifecycle(caseId)
      .then(setData)
      .catch(() => setError("Failed to load lifecycle explanation"));
  }, [caseId]);

  if (error) {
    return <SectionCard title="Current Lifecycle">{error}</SectionCard>;
  }

  if (!data) {
    return <SectionCard title="Current Lifecycle">Loading…</SectionCard>;
  }

  return (
    <SectionCard title="Current Lifecycle">
      <KeyValue label="Lifecycle" value={data.lifecycle} />

      {data.causedByDecision ? (
        <>
          <Divider />
          <KeyValue
            label="Decision Type"
            value={data.causedByDecision.decisionType}
          />
          <KeyValue
            label="Decided At"
            value={new Date(data.causedByDecision.decidedAt).toLocaleString()}
          />
          <KeyValue
            label="Actor"
            value={
              data.causedByDecision.actorUserId ??
              data.causedByDecision.actorKind
            }
          />
          {data.causedByDecision.reason && (
            <KeyValue label="Reason" value={data.causedByDecision.reason} />
          )}
        </>
      ) : (
        <>
          <Divider />
          <div className="text-xs text-ink/60">
            No authoritative decision found
          </div>
        </>
      )}
    </SectionCard>
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
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-ink/60">{label}</span>
      <span className="font-mono text-right">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="my-2 border-t border-line/40" />;
}
