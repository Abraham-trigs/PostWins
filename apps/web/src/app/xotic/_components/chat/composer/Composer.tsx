"use client";

import { useId, useMemo } from "react";
import { Plus, Trash2, Send } from "lucide-react";
import { usePostWinStore } from "../store/usePostWinStore";
import type { EvidenceKind } from "../store/types";

import { ModeTab } from "../ModeTab";
import { MenuItem } from "../MenuItem";
import { AttachmentChip } from "../AttachmentChip";
import {
  IconAudio,
  IconDocument,
  IconImage,
  IconPaperclip,
  IconSend,
  IconVideo,
} from "../icons";

import { getModeCopy } from "./modeCopy";
import { useAttachmentPicker } from "./useAttachmentPicker";

// ✅ API
import { bootstrapIntake, deliveryIntake } from "../../api/intake";

function summarizeEvidence(evidence: Array<{ kind: string }>) {
  const counts = evidence.reduce<Record<string, number>>((acc, e) => {
    acc[e.kind] = (acc[e.kind] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([k, v]) => `${v} ${k}`)
    .join(", ");
}

export function Composer() {
  const inputId = useId();

  const mode = usePostWinStore((s) => s.composerMode);
  const text = usePostWinStore((s) => s.composerText);
  const evidence = usePostWinStore((s) => s.draft.evidence ?? []);
  const submitting = usePostWinStore((s) => s.submitting);

  const questionnaireActive = usePostWinStore((s) => s.questionnaire.active);

  const setComposerMode = usePostWinStore((s) => s.setComposerMode);
  const setComposerText = usePostWinStore((s) => s.setComposerText);
  const clearComposer = usePostWinStore((s) => s.clearComposer);

  const addEvidence = usePostWinStore((s) => s.addEvidence);
  const removeEvidence = usePostWinStore((s) => s.removeEvidence);

  const appendText = usePostWinStore((s) => s.appendText);
  const appendEvent = usePostWinStore((s) => s.appendEvent);
  const patchDraft = usePostWinStore((s) => s.patchDraft);

  const submitBootstrap = usePostWinStore((s) => s.submitBootstrap);

  // ✅ Delivery wiring
  const submitDelivery = usePostWinStore((s) => s.submitDelivery);
  const deliveryDraft = usePostWinStore((s) => s.deliveryDraft);
  const patchDeliveryDraft = usePostWinStore((s) => s.patchDeliveryDraft);

  const {
    attachOpen,
    setAttachOpen,
    attachWrapRef,
    triggerAttach,
    imageInputRef,
    videoInputRef,
    docInputRef,
    audioInputRef,
  } = useAttachmentPicker();

  const canSubmit = text.trim().length > 0 || evidence.length > 0;

  const copy = useMemo(() => getModeCopy(mode), [mode]);
  const { placeholder, primaryLabel, modeLabel } = copy;

  // 🔒 Composer lock rule
  const composerLocked = questionnaireActive && mode !== "delivery";

  const onPicked = (kind: EvidenceKind, files: FileList | null) => {
    if (!files || files.length === 0) return;

    addEvidence(kind, Array.from(files));
    setAttachOpen(false);

    const nextEvidence = [
      ...evidence,
      ...Array.from(files).map(() => ({ kind })),
    ];
    appendEvent({
      title: "Evidence attached",
      meta: summarizeEvidence(nextEvidence),
      status: "logged",
    });
  };

  const handleSubmit = async () => {
    if (composerLocked || !canSubmit || submitting) return;

    const trimmed = text.trim();

    if (trimmed.length > 0) appendText("user", trimmed, mode);

    if (mode === "record" && trimmed.length > 0) {
      patchDraft({ narrative: trimmed });
      await submitBootstrap({ submit: bootstrapIntake });
      clearComposer();
      return;
    }

    clearComposer();
  };

  const isDelivery = mode === "delivery";
  const locationError =
    isDelivery && deliveryDraft.location.trim().length === 0;

  const hasValidItem =
    isDelivery &&
    deliveryDraft.items.some(
      (i) => i.name.trim().length > 0 && Number(i.qty) > 0,
    );

  const canSendDelivery = isDelivery && !locationError && hasValidItem;

  return (
    <footer
      aria-label="Message composer"
      className="h-[var(--xotic-composer-h)] px-[var(--xotic-pad-6)] flex items-center gap-3 bg-paper border-t border-line/50"
    >
      {/* Mode Tabs */}
      <div className="flex items-center gap-2 rounded-full p-1 bg-surface-strong border border-line/50">
        <div role="tablist" className="flex items-center">
          <ModeTab
            active={mode === "record"}
            disabled={composerLocked}
            onClick={() => !composerLocked && setComposerMode("record")}
          >
            Record
          </ModeTab>
          <ModeTab
            active={mode === "verify"}
            disabled={composerLocked}
            onClick={() => !composerLocked && setComposerMode("verify")}
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

      {/* Input */}
      <div className="min-w-0 flex-1">
        <div className="relative" ref={attachWrapRef}>
          <button
            type="button"
            disabled={composerLocked}
            onClick={() => !composerLocked && setAttachOpen((v) => !v)}
            className={`absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full grid place-items-center ${
              composerLocked
                ? "text-ink/40 cursor-not-allowed"
                : "text-ink/80 hover:bg-surface"
            }`}
          >
            <IconPaperclip />
          </button>

          <input
            id={inputId}
            value={text}
            disabled={composerLocked}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder={
              composerLocked
                ? "Complete the step above to continue…"
                : placeholder
            }
            onKeyDown={(e) => {
              if (composerLocked) return;
              if (e.key === "Enter" && !attachOpen) handleSubmit();
            }}
            className={`w-full h-10 rounded-full pl-12 pr-4 text-sm border border-line/50 ${
              composerLocked
                ? "bg-surface-muted text-ink/50"
                : "bg-[#6b8d87] text-paper placeholder:text-paper/60"
            }`}
          />
        </div>

        {!composerLocked && (
          <div className="mt-1 px-3 text-[10px] uppercase tracking-wider font-semibold text-ink/60">
            {modeLabel} • Audit-first • Draft-authoritative
          </div>
        )}
      </div>

      {/* Send Button */}
      {!isDelivery && (
        <button
          type="button"
          disabled={composerLocked || !canSubmit || submitting}
          onClick={handleSubmit}
          className={`h-10 w-10 rounded-full grid place-items-center ${
            !composerLocked && canSubmit && !submitting
              ? "bg-red text-white"
              : "bg-surface-strong text-ink/60 cursor-not-allowed"
          }`}
        >
          <IconSend />
        </button>
      )}

      {/* Hidden inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onPicked("image", e.target.files)}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => onPicked("video", e.target.files)}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
        multiple
        className="hidden"
        onChange={(e) => onPicked("document", e.target.files)}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => onPicked("audio", e.target.files)}
      />
    </footer>
  );
}
