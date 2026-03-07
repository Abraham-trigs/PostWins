"use client";

import { useId, useMemo, useState, useRef, useEffect } from "react";
import { usePostWinStore } from "@postwin-store/usePostWinStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import type { ChatMessage, NavigationContext } from "@postwin-store/types";
import {
  Paperclip as IconPaperclip,
  Send as IconSend,
  Plus as IconPlus,
  X as IconX,
} from "lucide-react";
import { getModeCopy } from "@ui/chat/composer/modeCopy";
import { useAttachmentPicker } from "@ui/chat/composer/useAttachmentPicker";

import { createMessage } from "@/lib/api/contracts/domain/message";

// 🚀 IMPORTED MAPPER LOGIC
import { mapModeToBackendType } from "../../store/mappers/message.mapper";

export function Composer() {
  const inputId = useId();
  const [actionsOpen, setActionsOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  /* ================= Store Selectors ================= */
  const mode = usePostWinStore((s) => s.composerMode);
  const text = usePostWinStore((s) => s.composerText);
  const submitting = usePostWinStore((s) => s.submitting);

  const setComposerMode = usePostWinStore((s) => s.setComposerMode);
  const setComposerText = usePostWinStore((s) => s.setComposerText);
  const clearComposer = usePostWinStore((s) => s.clearComposer);

  const appendMessage = usePostWinStore((s) => s.appendMessage);
  const confirmMessage = usePostWinStore((s) => s.confirmMessage);
  const rollbackMessage = usePostWinStore((s) => s.rollbackMessage);

  const caseId = usePostWinStore((s) => s.activeCaseId);
  const currentUserId = usePostWinStore((s) => s.currentUserId);

  const { setAttachOpen, attachWrapRef } = useAttachmentPicker();

  /* ================= Capabilities (ALIGNED WITH BACKEND) ================= */
  // Technical IDs (record, followup, etc.) stay behind the scenes.
  // Labels (Discussion, Evidence, etc.) are shown to the user.
  const capabilities = useMemo(
    () => [
      { id: "record", label: "Discussion", active: mode === "record" },
      { id: "followup", label: "Follow Up", active: mode === "followup" },
      { id: "verify", label: "Verify", active: mode === "verify" },
      { id: "delivery", label: "Evidence", active: mode === "delivery" },
    ],
    [mode],
  );

  /* ================= Derived ================= */
  const activeLabel = useMemo(
    () => capabilities.find((c) => c.id === mode)?.label || "Discussion",
    [mode, capabilities],
  );

  const { placeholder } = useMemo(() => getModeCopy(mode), [mode]);

  // 🛑 GATE: Identify if the current active case is a local UI-only draft
  const isDraft = caseId?.startsWith("draft_");

  // Logic: canSubmit is true for typing, but we block it during the Intake (isDraft)
  const canSubmit = text.trim().length > 0 && !isDraft;

  /* ================= Click Outside Close ================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setActionsOpen(false);
      }
    };
    if (actionsOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionsOpen]);

  function buildNavigationContext(): NavigationContext | null {
    if (mode !== "verify" || !caseId) return null;
    return {
      target: "TASK",
      id: caseId,
      label: "Review Case Details",
      params: { highlight: true, focus: true, mode: "peek" },
    };
  }

  /* ================= Submit Logic ================= */
  const handleSubmit = async () => {
    if (!canSubmit || submitting || isDraft) return;

    const trimmed = text.trim();
    const { tenantId } = useAuthStore.getState();

    if (!trimmed || !caseId || !currentUserId || !tenantId) return;

    const tempId = crypto.randomUUID();

    const optimisticMessage: ChatMessage = {
      id: tempId,
      kind: "text",
      role: "user",
      mode,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    try {
      appendMessage(optimisticMessage);
      clearComposer();

      const serverMessage = await createMessage({
        caseId,
        type: mapModeToBackendType(mode as any), // 🚀 USES MAPPER
        body: trimmed,
        parentId: null,
        navigationContext: buildNavigationContext(),
        clientMutationId: tempId,
      });

      confirmMessage(tempId, serverMessage.id);
    } catch (err) {
      rollbackMessage(tempId);
      setComposerText(trimmed);
      console.error("Composer submit failed:", err);
    }
  };

  /* ================= Render ================= */
  return (
    <footer className="h-[var(--xotic-composer-h)] px-[var(--xotic-pad-6)] flex items-center gap-4 bg-paper border-t border-line/40 relative">
      <div className="relative" ref={trayRef}>
        <button
          type="button"
          onClick={() => setActionsOpen((v) => !v)}
          className={`flex items-center gap-2 h-10 px-4 rounded-full border transition-all text-xs font-bold uppercase tracking-wider
            ${
              actionsOpen
                ? "bg-ink text-paper border-ink"
                : "bg-surface-strong border-line/60 text-ink/70 hover:border-line"
            }`}
        >
          {actionsOpen ? <IconX size={14} /> : <IconPlus size={14} />}
          {/* 🏷️ LABELED ACTIONS UX: Button shows active label instead of "Actions" when closed */}
          {actionsOpen ? "Actions" : activeLabel}
        </button>

        {actionsOpen && (
          <div className="absolute bottom-14 left-0 flex flex-col min-w-[160px] bg-paper/95 backdrop-blur-md border border-line/40 rounded-2xl p-1.5 shadow-2xl z-50">
            {capabilities.map((cap) => (
              <button
                key={cap.id}
                onClick={() => {
                  setComposerMode(cap.id as any);
                  setActionsOpen(false);
                }}
                className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors
                  ${
                    cap.active
                      ? "bg-blue-50 text-blue-600"
                      : "text-ink/80 hover:bg-surface"
                  }`}
              >
                {cap.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 flex flex-col">
        <div className="relative group" ref={attachWrapRef}>
          <button
            type="button"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full grid place-items-center text-ink/40 hover:text-ink hover:bg-surface transition-colors"
          >
            <IconPaperclip size={16} />
          </button>

          <input
            id={inputId}
            value={text}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isDraft}
            className="w-full h-11 rounded-full pl-11 pr-4 text-sm border border-line/40 bg-surface focus:bg-paper focus:ring-2 focus:ring-blue-100 outline-none text-ink disabled:opacity-50"
          />
        </div>

        <div className="mt-1.5 px-4 flex items-center gap-2">
          <span
            className={`h-1 w-1 rounded-full animate-pulse ${isDraft ? "bg-orange-500" : "bg-blue-500"}`}
          />
          <span
            className={`text-[10px] uppercase tracking-widest font-bold ${isDraft ? "text-orange-600" : "text-blue-600/80"}`}
          >
            {isDraft ? "Intake Questionnaire Active" : activeLabel}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
        className={`h-11 w-11 rounded-full grid place-items-center transition-all
          ${
            canSubmit && !submitting
              ? "bg-blue-600 text-white hover:scale-105 active:scale-95"
              : "bg-surface-strong text-ink/20 cursor-not-allowed border border-line/20"
          }`}
      >
        <IconSend size={18} />
      </button>
    </footer>
  );
}
