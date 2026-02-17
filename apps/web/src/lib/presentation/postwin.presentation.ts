import type { PostWinLifecycle } from "@/lib/domain/postwin.types";

export type LifecyclePresentation = {
  label: string;
  tone: "neutral" | "success" | "warning" | "danger" | "info";
};

export const lifecyclePresentationMap: Record<
  PostWinLifecycle,
  LifecyclePresentation
> = {
  INTAKE: { label: "Intake", tone: "neutral" },
  ROUTED: { label: "Routed", tone: "info" },
  ACCEPTED: { label: "Accepted", tone: "info" },
  EXECUTING: { label: "In Progress", tone: "info" },
  VERIFIED: { label: "Verified", tone: "success" },
  FLAGGED: { label: "Flagged", tone: "warning" },
  HUMAN_REVIEW: { label: "Under Review", tone: "warning" },
  COMPLETED: { label: "Completed", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
  ARCHIVED: { label: "Archived", tone: "neutral" },
};
