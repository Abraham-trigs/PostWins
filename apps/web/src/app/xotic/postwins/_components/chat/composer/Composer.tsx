"use client";

import { useId, useMemo } from "react";
import { usePostWinStore } from "../store/usePostWinStore";
import type { EvidenceKind } from "../store/types";

import { ModeTab } from "../ModeTab";
import { AttachmentChip } from "../AttachmentChip";
import { IconPaperclip, IconSend } from "../icons";

import { getModeCopy } from "./modeCopy";
import { useAttachmentPicker } from "./useAttachmentPicker";

// ✅ API
import { bootstrapIntake } from "../../../../../../lib/api/intake.api";

// ✅ Reusable decision button
import { DecisionButton } from "../UI/DecisionButton";

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

  const questionnaire = usePostWinStore((s) => s.questionnaire);

  const setComposerMode = usePostWinStore((s) => s.setComposerMode);
  const setComposerText = usePostWinStore((s) => s.setComposerText);
  const clearComposer = usePostWinStore((s) => s.clearComposer);

  const addEvidence = usePostWinStore((s) => s.addEvidence);
  const appendEvent = usePostWinStore((s) => s.appendEvent);
  const appendText = usePostWinStore((s) => s.appendText);
  const patchDraft = usePostWinStore((s) => s.patchDraft);

  const submitBootstrap = usePostWinStore((s) => s.submitBootstrap);

  const {
    attachOpen,
    setAttachOpen,
    attachWrapRef,
    imageInputRef,
    videoInputRef,
    docInputRef,
    audioInputRef,
  } = useAttachmentPicker();

  const copy = useMemo(() => getModeCopy(mode), [mode]);
  const { placeholder, modeLabel } = copy;

  const isReview = questionnaire.active && questionnaire.step === "review";
  const composerLocked = questionnaire.active && !isReview;

  const canSubmit = text.trim().length > 0 || evidence.length > 0;

  const onPicked = (kind: EvidenceKind, files: FileList | null) => {
    if (!files || files.length === 0) return;

    addEvidence(kind, Array.from(files));
    setAttachOpen(false);

    appendEvent({
      title: "Evidence attached",
      meta: summarizeEvidence(Array.from(files).map(() => ({ kind }))),
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

  /* =========================================================
     REVIEW ACTION BAR
  ========================================================= */

  if (isReview) {
    return (
      <footer
        aria-label="Review actions"
        className="h-[var(--xotic-composer-h)] px-[var(--xotic-pad-6)] flex items-center justify-between bg-paper border-t border-line/50"
      >
        <div>
          <div className="text-sm font-semibold text-ink">Review complete</div>
          <div className="text-xs text-ink/60">
            You can still edit the intake before creating this PostWin.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DecisionButton
            variant="secondary"
            disabled={submitting}
            onClick={() =>
              usePostWinStore.getState().goToQuestionnaireStep("step1_location")
            }
          >
            Edit intake
          </DecisionButton>

          <DecisionButton
            variant="primary"
            loading={submitting}
            onClick={() => usePostWinStore.getState().finalizeQuestionnaire()}
          >
            Confirm & Create
          </DecisionButton>
        </div>
      </footer>
    );
  }

  /* =========================================================
     NORMAL COMPOSER
  ========================================================= */

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
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full grid place-items-center text-ink/80 hover:bg-surface"
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
            className="w-full h-10 rounded-full pl-12 pr-4 text-sm border border-line/50 bg-[#6b8d87] text-paper placeholder:text-paper/60"
          />
        </div>

        {!composerLocked && (
          <div className="mt-1 px-3 text-[10px] uppercase tracking-wider font-semibold text-ink/60">
            {modeLabel} • Audit-first • Draft-authoritative
          </div>
        )}
      </div>

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
