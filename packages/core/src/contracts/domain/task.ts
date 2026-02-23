// packages/core/src/contracts/domain/task.ts
// Purpose: Deterministic task definition contract

export type Task = {
  id: string;
  order: number;
  label: string;
  requiredForSdg: string;
  dependencies: string[];
};
