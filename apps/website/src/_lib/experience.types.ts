// apps/website/src/_lib/experience.types.ts
export const PRIMARY_ROLES = [
  "donor",
  "regulator",
  "operator",
  "technical",
  "observer",
] as const;

export type PrimaryRole = (typeof PRIMARY_ROLES)[number] | null;

export interface ExperienceState {
  primaryRole: PrimaryRole;
  infrastructureInterest: boolean;
  hasCompletedSurvey: boolean;
}
