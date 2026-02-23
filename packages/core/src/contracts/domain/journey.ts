// packages/core/src/contracts/domain/journey.ts
// Purpose: Journey lifecycle transport contract (mirrors backend usage)

export type Journey = {
  id?: string;

  beneficiaryId: string;

  completedTaskIds: string[];

  createdAt?: string;
};
