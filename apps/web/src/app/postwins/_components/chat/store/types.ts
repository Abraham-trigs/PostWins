// src/app/xotic/postwins/_components/chat/store/types.ts
// Purpose: Authoritative thread types aligned with backend Message model,
// extended minimally to support optimistic UI lifecycle (architecture-safe).

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   ThreadMessage remains the domain model for chat state.
   We extend it minimally to support optimistic UI behavior
   (clientMutationId + receipts) without coupling to the
   transport-layer BackendMessage contract.

   These additional fields are:
   - Optional
   - UI/store lifecycle concerns only
   - Not required by backend persistence layer
========================================================= */

/* =========================================================
   Backend Message (Authoritative Thread Domain Model) PostWinDraft
======================================================== = */

export type MessageType =
  | "DISCUSSION"
  | "FOLLOW_UP"
  | "VERIFICATION_REQUEST"
  | "COUNTER_CLAIM"
  | "EVIDENCE_SUBMISSION"
  | "SYSTEM_EVENT";

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

/*=========================================================
VIEW FILTER
===========================================================*/

export type FeedFilter = "all" | "record" | "followup" | "verify" | "delivery";

/* =========================================================
   Delivery Receipt (UI lifecycle only)
========================================================= */

export type MessageReceipt = {
  deliveredAt?: string | null;
  seenAt?: string | null;
};

/* =========================================================
   ThreadMessage (Domain + Optimistic Lifecycle)
========================================================= */

export type ThreadMessage = {
  /* ================= Core Domain ================= */

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

  /* ================= Optimistic Lifecycle (Optional) ================= */

  /**
   * Present only for optimistic messages before server ACK.
   * Used for confirm / rollback reconciliation.
   */
  clientMutationId?: string | null;

  /**
   * Delivery state tracking.
   * Not required from backend, may be injected locally.
   */
  receipts?: Record<string, MessageReceipt>;
};

/* =========================================================
   Composer
========================================================= */

export type ComposerMode =
  | "discussion"
  | "record"
  | "followup"
  | "verify"
  | "delivery";

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
  sdgGoals?: string[];
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

/* =========================================================
   QUESTIONAIRE 
   ---------------------------------------------------------
/* =========================================================
   Questionnaire (UI-only flow state)
   ---------------------------------------------------------
   This is NOT part of backend ThreadMessage domain.
   It strictly supports the questionnaire slice UI flow.
========================================================= */

/**
 * Ordered UI steps for PostWin questionnaire.
 * Keep string literals stable — they are referenced in form_block messages.
 */
export type QuestionnaireStep = "step1_location" | "step2" | "review" | "done";

/**
 * Location answer collected in step1.
 * Extendable without breaking existing slice logic.
 */
export type QuestionnaireLocation = {
  digitalAddress: string;
  description?: string;
};

/**
 * Beneficiary answer collected in step2.
 * Mirrors PostWinDraft beneficiary structure for safe draft merge.
 */
export type QuestionnaireBeneficiary = {
  beneficiaryType: "individual" | "group" | "community" | "organization";
  beneficiaryName: string;
};

/**
 * Partial answers object.
 * Each step progressively fills this.
 */
export type QuestionnaireAnswers = {
  location?: QuestionnaireLocation;
  beneficiary?: QuestionnaireBeneficiary;
};

/**
 * ChatMessage
 * UI-authoritative timeline message model used by chat store.
 * This is intentionally separate from ThreadMessage (backend domain).
 */
export type ChatMessage =
  | {
      id: string;
      kind: "text";

      role: "system" | "user";
      mode?: "record" | "followup" | "verify" | "delivery";

      text: string;
      createdAt: string;

      // 🔹 Backend alignment
      authorId?: string;

      // 🔹 Real-time delivery/seen tracking
      receipts?: Record<
        string,
        {
          deliveredAt?: string | null;
          seenAt?: string | null;
        }
      >;
    }
  | {
      id: string;
      kind: "form_block";
      step: QuestionnaireStep | "beneficiary" | "review";
      createdAt: string;
    }
  | {
      id: string;
      kind: "action_row";
      actions: {
        id: string;
        label: string;
        value: string;
      }[];
      createdAt: string;
    };
/* =========================================================
   Implementation guidance ChatMessage
   ---------------------------------------------------------
   - API layer should map BackendMessage → ThreadMessage.
   - clientMutationId is generated locally before API call.
   - On ACK, replace temp id using confirmMessage().
   - receipts can be merged via applyReceipt().
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If future requirements introduce read receipts analytics
   or message state (edited, deleted, pinned), extend this
   lifecycle section — never the transport contract.
========================================================= */

// ThreadMessage
