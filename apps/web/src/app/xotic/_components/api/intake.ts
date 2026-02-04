// app/components/chat/api/intake.ts
"use client";

import type { PostWinDraft } from "../store/types";

export type BootstrapResponse = {
  ok: true;
  projectId: string;
  postWinId?: string | null;
};

type BootstrapPayload = {
  narrative: string;
  beneficiaryId?: string; // optional if you map it later
  category?: string;
  location?: unknown; // keep flexible (string or object)
  language?: string;
  sdgGoals?: string[]; // optional; backend defaults if missing
};

function makeIdempotencyKey() {
  // Offline-safe + retry-safe
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `idem_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function draftToBootstrapPayload(draft: PostWinDraft): BootstrapPayload {
  return {
    narrative: draft.narrative,
    category: draft.category,
    location: draft.location,
    language: draft.language,
    // sdgGoals optional; if you later add a draft field, map it here.
  };
}

export async function bootstrapIntake(draft: PostWinDraft): Promise<BootstrapResponse> {
  const res = await fetch("/api/intake/bootstrap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": makeIdempotencyKey(),
      "X-Source": "web",
      // Optional: add your actor id when you have auth/user
      // "X-Actor-Id": userId,
    },
    body: JSON.stringify(draftToBootstrapPayload(draft)),
  });

  const data = (await res.json()) as any;

  if (!res.ok) {
    throw new Error(data?.error || "Bootstrap failed");
  }

  // Backend returns { ok: true, projectId, postWinId? }
  return data as BootstrapResponse;
}
