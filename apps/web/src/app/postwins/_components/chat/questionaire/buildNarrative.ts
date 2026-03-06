// Purpose: Converts questionnaire answers into the narrative expected by backend bootstrap.

export type CaseDraftAnswers = {
  beneficiaryName?: string;
  issue?: string;
  location?: string;
  reason?: string;
  category?: string;
};

export function buildNarrative(draft: CaseDraftAnswers): string {
  const parts: string[] = [];

  if (draft.beneficiaryName) {
    parts.push(`${draft.beneficiaryName} is the beneficiary.`);
  }

  if (draft.issue) {
    parts.push(`Issue reported: ${draft.issue}.`);
  }

  if (draft.location) {
    parts.push(`Location: ${draft.location}.`);
  }

  if (draft.reason) {
    parts.push(`Reason support is requested: ${draft.reason}.`);
  }

  return parts.join(" ");
}
