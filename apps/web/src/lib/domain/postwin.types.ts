// apps/web/src/lib/domain/postwin.types.ts
// Purpose: Canonical frontend PostWin domain vocabulary decoupled from backend Case semantics.

////////////////////////////////////////////////////////////////
// Lifecycle (Authoritative Stage Vocabulary)
////////////////////////////////////////////////////////////////

export const PostWinLifecycleValues = [
  "INTAKE",
  "ROUTED",
  "ACCEPTED",
  "EXECUTING",
  "VERIFIED",
  "FLAGGED",
  "HUMAN_REVIEW",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "ARCHIVED",
] as const;

export type PostWinLifecycle = (typeof PostWinLifecycleValues)[number];

////////////////////////////////////////////////////////////////
// Advisory Status (UI Label Layer Only)
////////////////////////////////////////////////////////////////

export const PostWinStatusMap: Record<PostWinLifecycle, string> = {
  INTAKE: "Intaked",
  ROUTED: "Routed",
  ACCEPTED: "Accepted",
  EXECUTING: "In progress",
  VERIFIED: "Verified",
  FLAGGED: "Flagged",
  HUMAN_REVIEW: "In review",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

////////////////////////////////////////////////////////////////
// Routing Outcome (Snapshot Metadata)
////////////////////////////////////////////////////////////////

export const RoutingOutcomeValues = [
  "UNASSIGNED",
  "MATCHED",
  "FALLBACK",
  "BLOCKED",
] as const;

export type RoutingOutcome = (typeof RoutingOutcomeValues)[number];

////////////////////////////////////////////////////////////////
// Core List Projection (Desktop Left Panel)
////////////////////////////////////////////////////////////////

export type PostWinListItem = {
  id: string;

  // Authoritative
  lifecycle: PostWinLifecycle;

  // Snapshot metadata
  routingOutcome: RoutingOutcome;

  // Informational
  currentTask: string;
  type: string;
  scope: string;

  sdgGoal: string | null;
  summary: string | null;

  createdAt: string; // ISO
  updatedAt: string; // ISO
};

////////////////////////////////////////////////////////////////
// Details Projection (Explain View Model)
////////////////////////////////////////////////////////////////

export type PostWinDetails = {
  id: string;
  lifecycle: PostWinLifecycle;
  statusLabel: string;

  summary?: string;
  sdgGoal?: string;

  createdAt: string;
  updatedAt: string;

  authority: {
    activeCount: number;
    historyCount: number;
  };

  timelineCount: number;
  ledgerCount: number;

  hasDisbursement: boolean;
  hasCounterfactuals: boolean;
};

////////////////////////////////////////////////////////////////
// Pagination Model (Server-ready)
////////////////////////////////////////////////////////////////

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number | null;
  hasMore: boolean | null;
};

////////////////////////////////////////////////////////////////
// Query Parameters (Future-safe)
////////////////////////////////////////////////////////////////

export type ListPostWinsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  lifecycle?: PostWinLifecycle;
};

////////////////////////////////////////////////////////////////
// Identity Mapping (Backend IDs Resolved Here)
////////////////////////////////////////////////////////////////

export type PostWinIds = {
  postWinId: string;
};

////////////////////////////////////////////////////////////////
// Utility Helpers
////////////////////////////////////////////////////////////////

export function getPostWinStatusLabel(lifecycle: PostWinLifecycle): string {
  return PostWinStatusMap[lifecycle];
}

export function isTerminalLifecycle(lifecycle: PostWinLifecycle): boolean {
  return (
    lifecycle === "COMPLETED" ||
    lifecycle === "REJECTED" ||
    lifecycle === "CANCELLED" ||
    lifecycle === "ARCHIVED"
  );
}

////////////////////////////////////////////////////////////////
// Example Usage
////////////////////////////////////////////////////////////////

/*
import { getPostWinStatusLabel } from "@/lib/domain/postwin.types";

const label = getPostWinStatusLabel("EXECUTING");
// "In progress"
*/

////////////////////////////////////////////////////////////////
// Design reasoning
////////////////////////////////////////////////////////////////
// This file defines the canonical frontend vocabulary for PostWins.
// It prevents backend Case semantics from leaking directly into UI,
// stores, or chat layers. Lifecycle remains authoritative, while
// statusLabel is presentation-only. RoutingOutcome is treated as
// snapshot metadata, not business logic.

////////////////////////////////////////////////////////////////
// Structure
////////////////////////////////////////////////////////////////
// - Lifecycle enum values (authoritative stage)
// - UI label mapping layer
// - Routing snapshot metadata
// - List and Details view models
// - Pagination scaffolding
// - Utility helpers

////////////////////////////////////////////////////////////////
// Implementation guidance
////////////////////////////////////////////////////////////////
// Import these types into API boundary files and stores.
// Never import Prisma enums into the frontend.
// If backend lifecycle values change, update here first.
// Keep this file pure and free of network or UI dependencies.

////////////////////////////////////////////////////////////////
// Scalability insight
////////////////////////////////////////////////////////////////
// As explainability, execution, or financial models expand,
// extend PostWinDetails without altering PostWinListItem.
// Maintain separation between summary projection and deep explain view.
// Protect UX vocabulary from backend refactors at all costs.
