// src/app/xotic/postwins/_components/chat/store/types.ts
// Authoritative thread types aligned with backend Message model

//  later  reintroduce in-chat form blocks, do it in
// a separate projection layer — not inside the authoritative
//  message union.

/* =========================================================
   Backend Message (Authoritative Thread)
========================================================= */

export type MessageType =
  | "DISCUSSION"
  | "FOLLOW_UP"
  | "VERIFICATION_REQUEST"
  | "COUNTER_CLAIM"
  | "EVIDENCE_SUBMISSION";

export type NavigationContext = {
  target: "TASK" | "MESSAGE" | "EXTERNAL";
  id: string;
  params?: {
    highlight?: boolean;
    focus?: boolean;
    mode?: "peek" | "full";
  };
  label?: string;
};

export type ThreadMessage = {
  id: string;
  tenantId: string;
  caseId: string;
  authorId: string;
  parentId: string | null;
  type: MessageType;
  body: string | null;
  navigationContext: NavigationContext | null;
  metadata: Record<string, unknown> | null;
  isInternal: boolean;
  createdAt: string;
};

/* =========================================================
   Composer
========================================================= */

export type ComposerMode = "record" | "followup" | "verify" | "delivery";

/* =========================================================
   Evidence
========================================================= */

export type EvidenceKind = "image" | "video" | "document" | "audio";

export type EvidenceFile = {
  id: string;
  kind: EvidenceKind;
  file: File;
};

/* =========================================================
   Drafts (local UI state only — NOT thread)
========================================================= */

export type PostWinDraft = {
  narrative: string;
  beneficiaryType?: "individual" | "group" | "community" | "organization";
  beneficiaryName?: string;
  category?: string;
  location?: string;
  hasEvidence?: boolean;
  evidence?: EvidenceFile[];
  language?: string;
};

/* =========================================================
   Delivery Draft
========================================================= */

export type DeliveryItem = {
  name: string;
  qty: number;
};

export type DeliveryDraft = {
  location: string;
  items: DeliveryItem[];
  notes?: string;
};

/* =========================================================
   Backend identifiers
========================================================= */

export type PostWinIds = {
  projectId: string | null;
  postWinId: string | null;
};
