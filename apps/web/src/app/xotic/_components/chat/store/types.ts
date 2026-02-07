export type ChatRole = "user" | "system";

export type ComposerMode = "record" | "followup" | "verify" | "delivery";

export type EvidenceKind = "image" | "video" | "document" | "audio";

export type EvidenceFile = {
  id: string; // kind:name:size:lastModified (stable de-dupe key)
  kind: EvidenceKind;
  file: File;
};

/* =========================================================
   Chat Messages
========================================================= */

export type ChatMessage =
  | {
      id: string;
      kind: "text";
      role: ChatRole;
      text: string;
      createdAt: string;
      mode: ComposerMode;
    }
  | {
      id: string;
      kind: "event";
      title: string;
      meta: string;
      status: "pending" | "logged" | "failed";
      createdAt: string;
    }
  | {
      id: string;
      kind: "form_block";
      /**
       * `step` is the single source of truth
       * for which in-chat form/questionnaire UI to render.
       */
      step: // legacy / existing intake steps
        | "postwin_narrative"
        | "beneficiary"
        | "category_location"
        | "evidence"
        | "review"

        // questionnaire-driven steps (chat-native)
        | "step1_location";
      createdAt: string;
    }
  | {
      id: string;
      kind: "action_row";
      actions: Array<{ id: string; label: string; value: string }>;
      createdAt: string;
    };

/* =========================================================
   Drafts (local UI state, not backend truth)
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
   Delivery
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
   Questionnaire (chat-native intake)
========================================================= */

export type QuestionnaireStep = "step1_location" | "step2" | "review" | "done";

export type LocationAnswer = {
  digitalAddress: string;
  lat?: number;
  lng?: number;
  bounds?: any;
};

export type BeneficiaryAnswer = {
  beneficiaryType: "individual" | "group" | "community" | "organization";
  beneficiaryName?: string;
};

export type QuestionnaireAnswers = {
  location?: LocationAnswer;
  beneficiary?: BeneficiaryAnswer;
};

/* =========================================================
   Backend identifiers (resolved later)
========================================================= */

export type PostWinIds = {
  projectId: string | null;
  postWinId: string | null;
};

/**
 * Utility: all possible in-chat intake steps
 * (keeps renderers type-safe)
 */
export type IntakeStep = Extract<ChatMessage, { kind: "form_block" }>["step"];
