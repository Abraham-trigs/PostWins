"use client";

import { useState } from "react";

type BeneficiaryType = "individual" | "group" | "community" | "organization";

export type BeneficiaryAnswer = {
  beneficiaryType: BeneficiaryType;
  beneficiaryName?: string;
};

type Props = {
  value?: BeneficiaryAnswer;
  onAnswer: (value: BeneficiaryAnswer) => void;
};

const OPTIONS: Array<{ id: BeneficiaryType; label: string }> = [
  { id: "individual", label: "Individual" },
  { id: "group", label: "Group" },
  { id: "community", label: "Community" },
  { id: "organization", label: "Organization" },
];

export default function Step2Beneficiary({ value, onAnswer }: Props) {
  const [type, setType] = useState<BeneficiaryType | null>(
    value?.beneficiaryType ?? null,
  );
  const [name, setName] = useState(value?.beneficiaryName ?? "");

  const canContinue = Boolean(type);

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h3 className="text-sm font-semibold text-ink">
          Who is this PostWin for?
        </h3>
        <p className="text-xs text-ink/65">
          Choose the beneficiary type. You can optionally add a name.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setType(o.id)}
            className={[
              "rounded-lg border px-3 py-2 text-sm font-semibold",
              type === o.id
                ? "bg-[var(--brand-primary)] text-ink border-transparent"
                : "bg-surface border-line/50 text-ink/80 hover:bg-surface-strong",
            ].join(" ")}
          >
            {o.label}
          </button>
        ))}
      </div>

      {type && (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-ink/70">
            Beneficiary name (optional)
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              type === "individual"
                ? "e.g. Nii Bortey"
                : "e.g. China Youth Group"
            }
            className="w-full h-9 rounded-lg px-3 text-sm bg-surface-strong border border-line/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() =>
            onAnswer({
              beneficiaryType: type!,
              beneficiaryName: name.trim() || undefined,
            })
          }
          className={[
            "h-9 px-4 rounded-full text-sm font-semibold",
            canContinue
              ? "bg-[var(--brand-primary)] text-ink"
              : "bg-surface-strong text-ink/50 cursor-not-allowed",
          ].join(" ")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
