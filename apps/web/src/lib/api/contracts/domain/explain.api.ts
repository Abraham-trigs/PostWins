// apps/web/src/lib/api/explain.api.ts

import { fetcher } from "@/lib/offline/fetcher";
import { DecisionType } from "@prisma/client";

export const explainApi = {
  lifecycle: (caseId: string) =>
    fetcher(`/api/cases/${caseId}/lifecycle/explain`),

  authoritativeDecision: (caseId: string, type: DecisionType) =>
    fetcher(`/api/cases/${caseId}/decisions/${type}`),

  decisionHistory: (caseId: string, type: DecisionType) =>
    fetcher(`/api/cases/${caseId}/decisions/${type}/history`),

  ledger: (caseId: string) => fetcher(`/api/cases/${caseId}/ledger`),

  routingCounterfactual: (caseId: string) =>
    fetcher(`/api/cases/${caseId}/routing/counterfactual`),
};
