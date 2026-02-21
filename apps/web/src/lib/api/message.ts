// Backend Message DTO (exactly matches API)

export type BackendMessageType =
  | "DISCUSSION"
  | "FOLLOW_UP"
  | "VERIFICATION_REQUEST"
  | "COUNTER_CLAIM"
  | "EVIDENCE_SUBMISSION";

export type BackendNavigationContext = {
  target: "TASK" | "MESSAGE" | "EXTERNAL";
  id: string;
  params?: {
    highlight?: boolean;
    focus?: boolean;
    mode?: "peek" | "full";
  };
  label?: string;
};

export interface BackendMessage {
  id: string;
  tenantId: string;
  caseId: string;
  authorId: string;
  parentId: string | null;
  type: BackendMessageType;
  body: string | null;
  navigationContext: BackendNavigationContext | null;
  metadata: Record<string, unknown> | null;
  isInternal: boolean;
  createdAt: string; // ISO
}
