"use client";

import type { QuestionnaireAnswers } from "../store/types";

type Props = {
  answers: QuestionnaireAnswers;
  onConfirm: () => void;
  onEdit: () => void;
};

export default function ReviewStep({ answers, onConfirm, onEdit }: Props) {
  const location = answers.location;
  const beneficiary = answers.beneficiary;

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h3 className="text-sm font-semibold text-ink">Review details</h3>
        <p className="text-xs text-ink/65">
          Please confirm the information below before continuing.
        </p>
      </header>

      <div className="space-y-3 rounded-lg border border-line/50 bg-surface-strong p-3">
        <div>
          <p className="text-xs font-semibold text-ink/70">Location</p>
          <p className="text-sm text-ink">{location?.digitalAddress ?? "—"}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink/70">Beneficiary</p>
          <p className="text-sm text-ink">
            {beneficiary?.beneficiaryType ?? "—"}
            {beneficiary?.beneficiaryName
              ? ` • ${beneficiary.beneficiaryName}`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-ink/70 hover:text-ink"
        >
          Edit answers
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="h-9 px-4 rounded-full text-sm font-semibold bg-[var(--brand-primary)] text-ink"
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
}
