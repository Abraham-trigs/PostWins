"use client";

import { useEffect, useState } from "react";
import { explainApi } from "@/lib/api/contracts/domain/explain.api";

/* ================= Types ================= */

type Props = {
  caseId: string;
};

export type Counterfactual = {
  chosen?: Record<string, unknown> | null;
  constraintsApplied?: Record<string, unknown> | null;
  alternatives?: Record<string, unknown> | null;
};

/* ================= Component ================= */

export function RoutingCounterfactual({ caseId }: Props) {
  const [data, setData] = useState<Counterfactual | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const isDraft = caseId.startsWith("draft_");

  useEffect(() => {
    let mounted = true;

    // GATE: Prevent execution for local UI drafts
    if (!caseId || isDraft) {
      if (mounted) {
        setData(null);
        setError(false);
        setLoading(false);
      }
      return;
    }

    async function load() {
      setLoading(true);
      setError(false);
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
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [caseId, isDraft]);

  return (
    <SectionCard title="Routing Counterfactuals">
      <div className="mb-2 text-[11px] text-ink/60 italic leading-snug">
        Informational only — did not affect authority
      </div>

      {isDraft && (
        <div className="py-6 px-4 border border-dashed border-line/30 rounded-lg text-center bg-surface-muted/20">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink/30 mb-2">
            Simulation Pending
          </p>
          <p className="text-xs text-ink/40 italic">
            Counterfactual routing models are calculated once the case is
            committed to the ledger.
          </p>
        </div>
      )}

      {!isDraft && error && (
        <div className="text-xs text-red-400/70 p-2 rounded bg-red-50/5 border border-red-200/10">
          Failed to load counterfactuals
        </div>
      )}

      {!isDraft && loading && (
        <div className="h-24 w-full bg-paper/50 rounded animate-pulse border border-line/10" />
      )}

      {!isDraft && !loading && !error && !data && (
        <div className="text-xs text-ink/40 italic py-4 text-center">
          No counterfactuals recorded
        </div>
      )}

      {!isDraft && !loading && data && (
        <div className="space-y-4 text-xs mt-4">
          {data.chosen && (
            <JsonBlock label="Chosen Route" value={data.chosen} />
          )}

          {data.constraintsApplied && (
            <JsonBlock
              label="Applied Constraints"
              value={data.constraintsApplied}
            />
          )}

          {data.alternatives && (
            <JsonBlock
              label="Evaluation Alternatives"
              value={data.alternatives}
            />
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
    <div className="animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-tight text-ink/40 pl-1">
        {label}
      </div>
      <pre className="max-h-64 overflow-auto rounded-lg border border-line/40 bg-zinc-950 p-3 text-[10px] text-zinc-300 font-mono shadow-inner">
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
    <section className="rounded-xl border border-line/50 bg-surface p-5 shadow-sm">
      <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-ink/40">
        {title}
      </div>
      {children}
    </section>
  );
}
