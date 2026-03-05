// app/components/details/DetailsPanel.tsx
// Purpose: Thin wrapper that forwards selected caseId into authoritative DetailsPanelSelected.

"use client";

import { DetailsPanelSelected } from "./DetailsPanelSelected";

type Props = {
  caseId: string; // REQUIRED
  onOpenFullScreen?: () => void;
};

export function DetailsPanel({ caseId, onOpenFullScreen }: Props) {
  if (!caseId) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-ink/60">
        Select a case to view details.
      </div>
    );
  }

  return (
    <DetailsPanelSelected caseId={caseId} onOpenFullScreen={onOpenFullScreen} />
  );
}
