// app/components/chat/store/types.ts

export type ChatRole = "user" | "system";

export type ComposerMode = "record" | "followup" | "verify" | "delivery";
export type EvidenceKind = "image" | "video" | "document" | "audio";

export type EvidenceFile = {
  id: string; // kind:name:size:lastModified (stable de-dupe key)
  kind: EvidenceKind;
  file: File;
};

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
      step:
        | "postwin_narrative"
        | "beneficiary"
        | "category_location"
        | "evidence"
        | "review";
      createdAt: string;
    }
  | {
      id: string;
      kind: "action_row";
      actions: Array<{ id: string; label: string; value: string }>;
      createdAt: string;
    };

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

/**
 * ✅ NEW — Delivery input contract
 * This replaces the fake:
 *   "Unknown" + [{ name: "Delivery", qty: 1 }]
 */

export type DeliveryItem = {
  name: string;
  qty: number;
};

export type DeliveryDraft = {
  location: string;
  items: DeliveryItem[];
  notes?: string;
};

/**
 * Backend truth (Option A):
 * - projectId = UI "PostWin" container id (timeline root)
 * - postWinId = verification/audit root (optional but supported)
 */
export type PostWinIds = {
  projectId: string | null;
  postWinId: string | null;
};

export type IntakeStep = (ChatMessage & { kind: "form_block" })["step"];
