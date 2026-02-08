import { PrismaClient, CaseLifecycle, RoutingOutcome } from "@prisma/client";
import { deriveCaseStatus } from "./deriveCaseStatus";

const prisma = new PrismaClient();

/**
 * Updates advisory case state.
 *
 * ⚠️ This function exists to CENTRALIZE writes.
 * Reading status/routingOutcome is free.
 * Writing them anywhere else is a code smell.
 */
export async function updateCaseAdvisoryState(params: {
  caseId: string;
  lifecycle: CaseLifecycle;
  routingOutcome?: RoutingOutcome;
}) {
  const { caseId, lifecycle, routingOutcome } = params;

  return prisma.case.update({
    where: { id: caseId },
    data: {
      lifecycle,
      status: deriveCaseStatus(lifecycle),
      ...(routingOutcome && { routingOutcome }),
    },
  });
}
