// packages/core/src/contracts/domain/execution.ts
// Purpose: Execution body transport contract

export type ExecutionBody = {
  id?: string;

  capabilities: string[];

  location?: {
    lat: number;
    lng: number;
  };
};
