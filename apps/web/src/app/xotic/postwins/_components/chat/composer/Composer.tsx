// src/app/xotic/postwins/_components/chat/composer/Composer.tsx
// Purpose: Deterministic optimistic Composer using clientMutationId lifecycle.

"use client";

import { useId, useMemo } from "react";
import { usePostWinStore } from "../store/usePostWinStore";
import { ModeTab } from "../ModeTab";
import { IconPaperclip, IconSend } from "../icons";
import { getModeCopy } from "./modeCopy";
import { useAttachmentPicker } from "./useAttachmentPicker";

import {
  createMessage,
  type BackendMessageType,
  type BackendNavigationContext,
  type BackendMessage,
} from "@/lib/api/message";

/* =========================================================
   Tenant Resolution
========================================================= */

function getTenantId(): string {
  const envTenant =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_TENANT_ID ?? "")
      : "";

  if (envTenant.trim()) return envTenant.trim();

  if (typeof window !== "undefined") {
    const ls = window.localStorage.getItem("posta.tenantId");
    if (ls?.trim()) return ls.trim();
  }

  throw new Error("Missing tenantId");
}

/* =========================================================
   Mode Mapping
========================================================= */

function mapModeToMessageType(mode: string): BackendMessageType {
  switch (mode) {
    case "record":
      return "DISCUSSION";
    case "verify":
      return "VERIFICATION_REQUEST";
    case "delivery":
      return "FOLLOW_UP";
    default:
      return "DISCUSSION";
  }
}

export function Composer() {
  const inputId = useId();

  /* ===================== Store ===================== */

  const mode = usePostWinStore((s) => s.composerMode);
  const text = usePostWinStore((s) => s.composerText);
  const submitting = usePostWinStore((s) => s.submitting);

  const setComposerMode = usePostWinStore((s) => s.setComposerMode);
  const setComposerText = usePostWinStore((s) => s.setComposerText);
  const clearComposer = usePostWinStore((s) => s.clearComposer);

  const appendMessage = usePostWinStore((s) => s.appendMessage);
  const rollbackMessage = usePostWinStore((s) => s.rollbackMessage);

  const caseId = usePostWinStore((s) => (s as any).ids?.projectId);
  const currentUserId = usePostWinStore((s) => s.currentUserId);

  /* ===================== UI ===================== */

  const { attachOpen, setAttachOpen, attachWrapRef } = useAttachmentPicker();

  const copy = useMemo(() => getModeCopy(mode), [mode]);
  const { placeholder, modeLabel } = copy;

  const canSubmit = text.trim().length > 0;

  function buildNavigationContext(): BackendNavigationContext | null {
    if (mode !== "verify" || !caseId) return null;

    return {
      target: "TASK",
      id: caseId,
      label: "Review Case Details",
      params: {
        highlight: true,
        focus: true,
        mode: "peek",
      },
    };
  }

  /* =========================================================
     Deterministic Submit
  ========================================================= */

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    const trimmed = text.trim();
    if (!trimmed || !caseId || !currentUserId) return;

    const mutationId = crypto.randomUUID(); // ⚡ deterministic token
    const tenantId = getTenantId();

    const optimisticMessage: BackendMessage = {
      id: mutationId, // temp ID
      clientMutationId: mutationId,
      tenantId,
      caseId,
      authorId: currentUserId,
      type: mapModeToMessageType(mode),
      body: trimmed,
      parentId: null,
      navigationContext: buildNavigationContext(),
      createdAt: new Date().toISOString(),
    };

    try {
      // 1️⃣ Optimistic insert
      appendMessage(optimisticMessage);
      clearComposer();

      // 2️⃣ Network call
      const serverMessage = await createMessage({
        tenantId,
        caseId,
        authorId: currentUserId,
        type: optimisticMessage.type,
        body: trimmed,
        parentId: null,
        navigationContext: optimisticMessage.navigationContext,
        clientMutationId: mutationId,
      });

      // 3️⃣ Deterministic reconciliation (atomic swap)
      appendMessage(serverMessage);
    } catch (err) {
      console.error("Message failed, rolling back", err);

      // 4️⃣ Rollback ghost
      rollbackMessage(mutationId);

      // Restore input
      setComposerText(trimmed);
    }
  };

  return (
    <footer className="h-[var(--xotic-composer-h)] px-[var(--xotic-pad-6)] flex items-center gap-3 bg-paper border-t border-line/50">
      <div className="flex items-center gap-2 rounded-full p-1 bg-surface-strong border border-line/50">
        <div role="tablist" className="flex items-center">
          <ModeTab
            active={mode === "record"}
            onClick={() => setComposerMode("record")}
          >
            Record
          </ModeTab>
          <ModeTab
            active={mode === "verify"}
            onClick={() => setComposerMode("verify")}
          >
            Verify
          </ModeTab>
          <ModeTab
            active={mode === "delivery"}
            onClick={() => setComposerMode("delivery")}
          >
            Delivery
          </ModeTab>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative" ref={attachWrapRef}>
          <button
            type="button"
            onClick={() => setAttachOpen((v) => !v)}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full grid place-items-center text-ink/80 hover:bg-surface"
          >
            <IconPaperclip />
          </button>

          <input
            id={inputId}
            value={text}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !attachOpen) handleSubmit();
            }}
            className="w-full h-10 rounded-full pl-12 pr-4 text-sm border border-line/50 bg-[#6b8d87] text-paper placeholder:text-paper/60"
          />
        </div>

        <div className="mt-1 px-3 text-[10px] uppercase tracking-wider font-semibold text-ink/60">
          {modeLabel} • Deterministic • Mutation-safe
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
        className={`h-10 w-10 rounded-full grid place-items-center transition-all ${
          canSubmit && !submitting
            ? "bg-red text-white shadow-md active:scale-95"
            : "bg-surface-strong text-ink/60 cursor-not-allowed"
        }`}
      >
        <IconSend />
      </button>
    </footer>
  );
}
