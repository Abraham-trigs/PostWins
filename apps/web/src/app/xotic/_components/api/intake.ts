// apps/web/src/app/xotic/_components/api/intake.ts
"use client";

import type { PostWinDraft } from "../chat/store/types";

export type BootstrapResponse = {
  ok: true;
  projectId: string;
  postWinId?: string | null;
};

type BootstrapPayload = {
  narrative: string;
  beneficiaryId?: string;
  category?: string;
  location?: unknown;
  language?: string;
  sdgGoals?: string[];
};

function makeTransactionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tx_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
// NOTE: Dev-only tenant selection. In production, tenantId must come from auth/session.w
/**
 * Dev tenant resolution:
 * 1) NEXT_PUBLIC_TENANT_ID
 * 2) localStorage posta.tenantId
 *
 */
function getTenantId(): string {
  const envTenant =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_TENANT_ID ?? "")
      : "";

  if (envTenant && envTenant.trim()) return envTenant.trim();

  if (typeof window !== "undefined") {
    const ls = window.localStorage.getItem("posta.tenantId");
    if (ls && ls.trim()) return ls.trim();
  }

  throw new Error(
    "Missing tenantId. Set NEXT_PUBLIC_TENANT_ID or localStorage posta.tenantId",
  );
}

function draftToBootstrapPayload(draft: PostWinDraft): BootstrapPayload {
  return {
    narrative: draft.narrative,
    category: draft.category,
    location: draft.location,
    language: draft.language,
  };
}

export async function bootstrapIntake(
  draft: PostWinDraft,
): Promise<BootstrapResponse> {
  const tenantId = getTenantId();

  const res = await fetch("/api/intake/bootstrap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
      "x-transaction-id": makeTransactionId(),
      "X-Source": "web",
      // later when auth exists:
      // "X-Actor-Id": userId,
    },
    body: JSON.stringify(draftToBootstrapPayload(draft)),
  });

  const data = (await res.json()) as any;

  if (!res.ok) {
    throw new Error(data?.error || "Bootstrap failed");
  }

  return data as BootstrapResponse;
}
