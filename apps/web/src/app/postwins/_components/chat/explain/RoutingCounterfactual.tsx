// src/app/postwins/postwins/_components/chat/explain/RoutingCounterfactual.tsx
// Purpose: Render routing counterfactual explanation safely with strict typing and defensive normalization.

"use client";

import { useEffect, useState } from "react";
import { explainApi } from "@/lib/api/contracts/domain/explain.api";

/* ================= Types ================= */

type Props = {
  caseId: string;
};

/**
 * Explicit structural typing instead of raw `unknown`.
 * Counterfactual payload is informational JSON only.
 */
export type Counterfactual = {
  chosen?: Record<string, unknown> | null;
  constraintsApplied?: Record<string, unknown> | null;
  alternatives?: Record<string, unknown> | null;
};

/* ================= Component ================= */

export function RoutingCounterfactual({ caseId }: Props) {
  const [data, setData] = useState<Counterfactual | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await explainApi.routingCounterfactual(caseId);

        // Defensive normalization at boundary
        const normalized: Counterfactual | null = res?.counterfactual
          ? {
              chosen:
                typeof res.counterfactual.chosen === "object"
                  ? res.counterfactual.chosen
                  : null,
              constraintsApplied:
                typeof res.counterfactual.constraintsApplied === "object"
                  ? res.counterfactual.constraintsApplied
                  : null,
              alternatives:
                typeof res.counterfactual.alternatives === "object"
                  ? res.counterfactual.alternatives
                  : null,
            }
          : null;

        if (mounted) setData(normalized);
      } catch {
        if (mounted) setError(true);
      }
    }

    if (caseId) load();

    return () => {
      mounted = false;
    };
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

/* ================= Helpers ================= */

function JsonBlock({
  label,
  value,
}: {
  label: string;
  value: Record<string, unknown>;
}) {
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
