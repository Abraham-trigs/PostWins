// packages/core/src/contracts/domain/context.ts
// Purpose: Shared contextual identity contract

export type PostaRole =
  | "BENEFICIARY"
  | "NGO_PARTNER"
  | "INTERNAL"
  | "EXECUTION_BODY";

export type PostaContext = {
  role: PostaRole;
  isImplicit: boolean;
};
