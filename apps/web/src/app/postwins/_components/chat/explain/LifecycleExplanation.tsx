"use client";

import { useEffect, useState } from "react";
import { explainApi } from "@/lib/api/contracts/domain/explain.api";

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
  const [loading, setLoading] = useState<boolean>(false);

  const isDraft = caseId.startsWith("draft_");

  useEffect(() => {
    // GATE: Do not fetch for UI-only drafts
    if (!caseId || isDraft) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    explainApi
      .lifecycle(caseId)
      .then((res) => setData(res))
      .catch(() => setError("Failed to load lifecycle explanation"))
      .finally(() => setLoading(false));
  }, [caseId, isDraft]);

  // UI state for local drafts
  if (isDraft) {
    return (
      <SectionCard title="Current Lifecycle">
        <div className="text-xs text-ink/40 italic">
          Waiting for project bootstrap...
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Current Lifecycle">
        <span className="text-red-500 text-xs">{error}</span>
      </SectionCard>
    );
  }

  if (loading || !data) {
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

/* ---------- UI helpers (SectionCard, KeyValue, Divider) ---------- */

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
      <span className="font-mono text-right break-all">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="my-2 border-t border-line/40" />;
}
