"use client";

import { useEffect, useState } from "react";
import { explainApi } from "@/lib/api/explain.api";

type Props = {
  caseId: string;
};

type Counterfactual = {
  chosen?: unknown;
  constraintsApplied?: unknown;
  alternatives?: unknown;
};

export function RoutingCounterfactual({ caseId }: Props) {
  const [data, setData] = useState<Counterfactual | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    explainApi
      .routingCounterfactual(caseId)
      .then((res) => setData(res?.counterfactual ?? null))
      .catch(() => setError(true));
  }, [caseId]);

  return (
    <SectionCard title="Routing Counterfactuals">
      <div className="mb-2 text-[11px] text-ink/60">
        Informational only — did not affect authority
      </div>

      {error && (
        <div className="text-xs text-ink/60">
          Failed to load counterfactuals
        </div>
      )}

      {!error && !data && (
        <div className="text-xs text-ink/60">No counterfactuals recorded</div>
      )}

      {!error && data && (
        <div className="space-y-3 text-xs">
          {data.chosen && <JsonBlock label="Chosen" value={data.chosen} />}

          {data.constraintsApplied && (
            <JsonBlock
              label="Constraints Applied"
              value={data.constraintsApplied}
            />
          )}

          {data.alternatives && (
            <JsonBlock label="Alternatives" value={data.alternatives} />
          )}
        </div>
      )}
    </SectionCard>
  );
}

/* ---------- helpers ---------- */

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <div className="mb-1 font-semibold text-ink/70">{label}</div>
      <pre className="max-h-64 overflow-auto rounded bg-surface-muted p-2 text-[10px]">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

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
