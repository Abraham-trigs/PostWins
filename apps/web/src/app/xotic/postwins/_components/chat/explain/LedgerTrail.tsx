"use client";

import { useEffect, useState } from "react";
import { explainApi } from "@/lib/api/explain.api";

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

  useEffect(() => {
    explainApi
      .ledger(caseId)
      .then((res) => setRows(res?.ledger ?? []))
      .catch(() => setError(true));
  }, [caseId]);

  return (
    <SectionCard title="Ledger (Immutable Facts)">
      {error && (
        <div className="text-xs text-ink/60">Failed to load ledger</div>
      )}

      {!error && rows.length === 0 && (
        <div className="text-xs text-ink/60">No ledger entries recorded</div>
      )}

      {!error && rows.length > 0 && (
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
    <div className="rounded border border-line/50 bg-paper p-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="font-mono">{new Date(row.ts).toLocaleString()}</div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[10px] underline text-ink/60"
        >
          {open ? "Hide payload" : "Show payload"}
        </button>
      </div>

      <div className="mt-1 text-ink/70">Event: {row.type}</div>

      {row.actorUserId && (
        <div className="mt-1 text-ink/70">Actor: {row.actorUserId}</div>
      )}

      {open && (
        <pre className="mt-2 max-h-64 overflow-auto rounded bg-surface-muted p-2 text-[10px]">
          {JSON.stringify(row.payload, null, 2)}
        </pre>
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
