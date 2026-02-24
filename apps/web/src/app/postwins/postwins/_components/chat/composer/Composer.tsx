"use client";

import { useId, useMemo, useState, useRef, useEffect } from "react";
import { usePostWinStore } from "../store/usePostWinStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  Paperclip as IconPaperclip,
  Send as IconSend,
  Plus as IconPlus,
  X as IconX,
} from "lucide-react"; // Direct import fixes "type is invalid" error
import { getModeCopy } from "./modeCopy";
import { useAttachmentPicker } from "./useAttachmentPicker";

import {
  createMessage,
  type BackendMessageType,
  type BackendNavigationContext,
  type BackendMessage,
} from "@/lib/api/contracts/domain/message";

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
  const [actionsOpen, setActionsOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  // Store Selectors
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

  const { attachOpen, setAttachOpen, attachWrapRef } = useAttachmentPicker();

  // Derived State
  const copy = useMemo(() => getModeCopy(mode), [mode]);
  const { placeholder, modeLabel } = copy;
  const canSubmit = text.trim().length > 0;

  /* =========================================================
     UX Improvements: Click Outside to Close
  ========================================================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setActionsOpen(false);
      }
    };
    if (actionsOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionsOpen]);

  /* =========================================================
     Lifecycle Logic
  ========================================================= */
  const capabilities = useMemo(
    () => [
      { id: "record", label: "Record", active: mode === "record" },
      { id: "verify", label: "Verify", active: mode === "verify" },
      { id: "delivery", label: "Delivery", active: mode === "delivery" },
    ],
    [mode],
  );

  function buildNavigationContext(): BackendNavigationContext | null {
    if (mode !== "verify" || !caseId) return null;
    return {
      target: "TASK",
      id: caseId,
      label: "Review Case Details",
      params: { highlight: true, focus: true, mode: "peek" },
    };
  }

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    const trimmed = text.trim();
    const { tenantId } = useAuthStore.getState();
    if (!trimmed || !caseId || !currentUserId || !tenantId) return;

    const mutationId = crypto.randomUUID();

    const optimisticMessage: BackendMessage = {
      id: mutationId,
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
      appendMessage(optimisticMessage);
      clearComposer();

      const serverMessage = await createMessage({
        caseId,
        type: optimisticMessage.type,
        body: trimmed,
        parentId: null,
        navigationContext: optimisticMessage.navigationContext,
        clientMutationId: mutationId,
      });

      appendMessage(serverMessage);
    } catch (err) {
      rollbackMessage(mutationId);
      setComposerText(trimmed);
      console.error("Composer submit failed:", err);
    }
  };

  return (
    <footer className="h-[var(--xotic-composer-h)] px-[var(--xotic-pad-6)] flex items-center gap-4 bg-paper border-t border-line/40 relative">
      {/* 🚀 ACTION BUTTON */}
      <div className="relative" ref={trayRef}>
        <button
          type="button"
          onClick={() => setActionsOpen((v) => !v)}
          className={`
            flex items-center gap-2 h-10 px-4 rounded-full border transition-all text-xs font-bold uppercase tracking-wider
            ${actionsOpen ? "bg-ink text-paper border-ink" : "bg-surface-strong border-line/60 text-ink/70 hover:border-line"}
          `}
        >
          {actionsOpen ? <IconX size={14} /> : <IconPlus size={14} />}
          Actions
        </button>

        {/* 🍿 ACTION TRAY */}
        {actionsOpen && (
          <div className="absolute bottom-14 left-0 flex flex-col min-w-[160px] bg-paper/95 backdrop-blur-md border border-line/40 rounded-2xl p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-50">
            <div className="px-3 py-2 text-[10px] font-bold text-ink/40 uppercase tracking-widest">
              Select Mode
            </div>
            {capabilities.map((cap) => (
              <button
                key={cap.id}
                onClick={() => {
                  setComposerMode(cap.id as any);
                  setActionsOpen(false);
                }}
                className={`
                  flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors
                  ${cap.active ? "bg-blue-50 text-blue-600" : "text-ink/80 hover:bg-surface"}
                `}
              >
                {cap.label}
                {cap.active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ⌨️ INPUT GROUP */}
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="relative group" ref={attachWrapRef}>
          <button
            type="button"
            onClick={() => setAttachOpen((v) => !v)}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full grid place-items-center text-ink/40 hover:text-ink hover:bg-surface transition-colors"
          >
            <IconPaperclip size={16} />
          </button>

          <input
            id={inputId}
            value={text}
            onFocus={() => setActionsOpen(false)}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full h-11 rounded-full pl-11 pr-4 text-sm border border-line/40 bg-surface focus:bg-paper focus:ring-2 focus:ring-blue-100 transition-all outline-none text-ink"
          />
        </div>

        <div className="mt-1.5 px-4 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600/80">
            {modeLabel}
          </span>
        </div>
      </div>

      {/* 📤 SUBMIT BUTTON */}
      <button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
        className={`
          h-11 w-11 rounded-full grid place-items-center transition-all shadow-sm
          ${
            canSubmit && !submitting
              ? "bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-blue-200"
              : "bg-surface-strong text-ink/20 cursor-not-allowed border border-line/20"
          }
        `}
      >
        <IconSend size={18} />
      </button>
    </footer>
  );
}
