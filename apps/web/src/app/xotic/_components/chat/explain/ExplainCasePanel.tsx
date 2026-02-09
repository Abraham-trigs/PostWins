import {
  LifecycleExplanation,
  AuthoritativeDecisions,
  DecisionHistory,
  LedgerTrail,
  RoutingCounterfactual,
} from "./sections/index";

export function ExplainCasePanel({ caseId }: { caseId: string }) {
  return (
    <div className="space-y-6">
      <LifecycleExplanation caseId={caseId} />
      <AuthoritativeDecisions caseId={caseId} />
      <DecisionHistory caseId={caseId} />
      <LedgerTrail caseId={caseId} />
      <RoutingCounterfactual caseId={caseId} />
    </div>
  );
}
