"use client";

import { useEffect, useState } from "react";
import { explainApi } from "@/lib/api/contracts/domain/explain.api";

type Props = {
  caseId: string;
};

type LedgerRow = {
  id: string;
  ts: string;
  type: string;
  actorUserId?: string;
  payload: unknown;
};

export function LedgerTrail({ caseId }: Props) {
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDraft = caseId.startsWith("draft_");

  useEffect(() => {
    // GATE: Prevent backend fetch for UI-only drafts
    if (!caseId || isDraft) {
      setRows([]);
      setError(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    explainApi
      .ledger(caseId)
      .then((res) => setRows(res?.ledger ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [caseId, isDraft]);

  return (
    <SectionCard title="Ledger (Immutable Facts)">
      {isDraft && (
        <div className="py-6 px-4 border border-dashed border-line/30 rounded-lg text-center bg-surface-muted/20">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30 mb-2">
            Genesis Pending
          </p>
          <p className="text-xs text-ink/40 italic leading-relaxed">
            The ledger is currently empty. Complete initialization to record the
            first authoritative commit.
          </p>
        </div>
      )}

      {!isDraft && error && (
        <div className="text-xs text-red-400/80 p-2 border border-red-200/20 rounded bg-red-50/5">
          Failed to synchronize with ledger authority.
        </div>
      )}

      {!isDraft && !loading && !error && rows.length === 0 && (
        <div className="text-xs text-ink/40 italic py-4 text-center">
          No immutable facts have been recorded for this case yet.
        </div>
      )}

      {!isDraft && loading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 w-full bg-paper/50 rounded animate-pulse border border-line/10"
            />
          ))}
        </div>
      )}

      {!isDraft && rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((row) => (
            <LedgerRowItem key={row.id} row={row} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ---------- row ---------- */

function LedgerRowItem({ row }: { row: LedgerRow }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group rounded-lg border border-line/50 bg-paper p-3 text-xs transition-all hover:border-line/80 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="font-mono text-[10px] text-ink/50 bg-surface px-2 py-0.5 rounded border border-line/20 shadow-inner">
          {new Date(row.ts).toLocaleString()}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[10px] font-bold uppercase tracking-tighter text-blue-600 hover:text-blue-500 transition-colors"
        >
          {open ? "Close Inspect" : "Inspect Payload"}
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex gap-2">
          <span className="text-ink/30 font-bold uppercase text-[9px] w-12">
            Event
          </span>
          <span className="text-ink/80 font-medium">{row.type}</span>
        </div>

        {row.actorUserId && (
          <div className="flex gap-2">
            <span className="text-ink/30 font-bold uppercase text-[9px] w-12">
              Actor
            </span>
            <span className="text-ink/60 font-mono truncate">
              {row.actorUserId}
            </span>
          </div>
        )}
      </div>

      {open && (
        <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
          <pre className="max-h-64 overflow-auto rounded-md bg-zinc-950 p-3 text-[10px] text-zinc-300 font-mono leading-relaxed border border-white/5 shadow-2xl">
            {JSON.stringify(row.payload, null, 2)}
          </pre>
        </div>
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
    <section className="rounded-xl border border-line/50 bg-surface p-5 shadow-sm">
      <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-ink/40 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        {title}
      </div>
      {children}
    </section>
  );
}
