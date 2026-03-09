// apps/web/src/modules/intake/questionnaire/buildNarrative.ts

import { caseQuestions } from "./caseQuestions";

export type CaseDraftAnswers = Record<string, string>;

export function buildNarrative(draft: CaseDraftAnswers): string {
  const parts: string[] = [];

  for (const q of caseQuestions) {
    const value = draft[q.id];
    if (!value || !value.trim()) continue;

    switch (q.field) {
      case "beneficiaryId": {
        let displayName = value.trim();

        // Check if value is the JSON payload from a new profile creation
        if (displayName.startsWith("{")) {
          try {
            const parsed = JSON.parse(displayName);
            displayName = parsed.displayName || "a new beneficiary";
          } catch (e) {
            // Fallback if parsing fails
          }
        }
        parts.push(`This Postwin case concerns beneficiary ${displayName}.`);
        break;
      }

      case "issue":
        parts.push(`The primary issue reported is: "${value.trim()}".`);
        break;

      case "location":
        parts.push(`Incident located at: ${value.trim()}.`);
        break;

      case "reason":
        parts.push(`Support is required: ${value.trim()}.`);
        break;

      case "category":
        parts.push(`Classification: ${value.trim()}.`);
        break;

      default:
        parts.push(`${q.label}: ${value.trim()}.`);
    }
  }

  // Join with double spaces for better readability in the Ledger Trail
  return parts.join("  ");
}
