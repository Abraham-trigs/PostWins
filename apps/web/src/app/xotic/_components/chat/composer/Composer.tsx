"use client";

import { useId, useMemo } from "react";
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
  const ids = usePostWinStore((s) => s.ids);

  const setComposerMode = usePostWinStore((s) => s.setComposerMode);
  const setComposerText = usePostWinStore((s) => s.setComposerText);
  const clearComposer = usePostWinStore((s) => s.clearComposer);

  const addEvidence = usePostWinStore((s) => s.addEvidence);
  const removeEvidence = usePostWinStore((s) => s.removeEvidence);

  const appendText = usePostWinStore((s) => s.appendText);
  const appendEvent = usePostWinStore((s) => s.appendEvent);
  const patchDraft = usePostWinStore((s) => s.patchDraft);

  const submitBootstrap = usePostWinStore((s) => s.submitBootstrap);

  // ✅ Delivery submit (added in the updated store file)
  const submitDelivery = usePostWinStore((s) => (s as any).submitDelivery);

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
    if (!canSubmit || submitting) return;

    const trimmed = text.trim();

    // Always audit the user's text into the timeline
    if (trimmed.length > 0) appendText("user", trimmed, mode);

    // RECORD: bootstrap backend case/postWin
    if (mode === "record" && trimmed.length > 0) {
      patchDraft({ narrative: trimmed });

      await submitBootstrap({ submit: bootstrapIntake });

      clearComposer();
      return;
    }

    // DELIVERY: record a delivery against the existing projectId (caseId)
    if (mode === "delivery" && trimmed.length > 0) {
      if (!ids.projectId) {
        appendEvent({
          title: "Delivery blocked",
          meta: "Missing projectId. Run Record (bootstrap) first.",
          status: "failed",
        });
        clearComposer();
        return;
      }

      const deliveryId = `delivery-${Date.now()}`;
      const occurredAt = new Date().toISOString();

      // Minimal wiring payload: you can replace items/location with a proper form later.
      const payload = {
        projectId: ids.projectId,
        deliveryId,
        occurredAt,
        location: "Unknown", // replace with real UI later
        items: [{ name: "Delivery", qty: 1 }],
        notes: trimmed,
      };

      // store submitDelivery keeps transactionId stable across retries
      await submitDelivery({
        submit: (p: any, ctx: { transactionId: string }) =>
          deliveryIntake(p, { transactionId: ctx.transactionId }),
      });

      clearComposer();
      return;
    }

    clearComposer();
  };

  return (
    <footer
      aria-label="Message composer"
      className={[
        "h-[var(--xotic-composer-h)] flex-shrink-0",
        "px-[var(--xotic-pad-6)]",
        "flex items-center gap-3",
        "bg-paper",
        "border-t border-line/50",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center gap-2 flex-shrink-0",
          "rounded-full p-1",
          "bg-surface-strong border border-line/50",
        ].join(" ")}
        aria-label="Composer controls"
      >
        <div
          role="tablist"
          aria-label="Entry type"
          className="flex items-center"
        >
          <ModeTab
            active={mode === "record"}
            onClick={() => setComposerMode("record")}
          >
            Record
          </ModeTab>
          <ModeTab
            active={mode === "followup"}
            onClick={() => setComposerMode("followup")}
          >
            Follow-up
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
        <label className="sr-only" htmlFor={inputId}>
          {primaryLabel}
        </label>

        <div className="relative" ref={attachWrapRef}>
          <button
            type="button"
            aria-label="Add attachment"
            aria-haspopup="menu"
            aria-expanded={attachOpen}
            onClick={() => setAttachOpen((v) => !v)}
            className={[
              "absolute left-2 top-1/2 -translate-y-1/2",
              "h-8 w-8 rounded-full grid place-items-center",
              "text-ink/80 hover:text-ink",
              "hover:bg-surface transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-danger)]",
            ].join(" ")}
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
              if (e.key === "Escape") setAttachOpen(false);
            }}
            className={[
              "w-full h-10 rounded-full pl-12 pr-4 text-sm",
              "bg-[#6b8d87]",
              "text-paper placeholder:text-paper/60",
              "border border-line/50",
              "focus:outline-none focus-visible:ring-[var(--state-danger)]",
            ].join(" ")}
          />

          {attachOpen && (
            <div
              role="menu"
              aria-label="Attachment types"
              className={[
                "absolute left-2 bottom-12 z-20",
                "min-w-52 rounded-[var(--xotic-radius)]",
                "bg-surface-strong text-ink border border-line/50 shadow-card",
                "p-1",
              ].join(" ")}
            >
              <MenuItem
                label="Image"
                icon={<IconImage />}
                onClick={() => triggerAttach("image")}
              />
              <MenuItem
                label="Video"
                icon={<IconVideo />}
                onClick={() => triggerAttach("video")}
              />
              <MenuItem
                label="Document"
                icon={<IconDocument />}
                onClick={() => triggerAttach("document")}
              />
              <MenuItem
                label="Audio"
                icon={<IconAudio />}
                onClick={() => triggerAttach("audio")}
              />
            </div>
          )}
        </div>

        {evidence.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 px-2">
            {evidence.map((e) => (
              <AttachmentChip
                key={e.id}
                evidence={e}
                onRemove={() => removeEvidence(e.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-1 px-3 text-[10px] uppercase tracking-wider font-semibold text-ink/60">
          {modeLabel} • Audit-first • Draft-authoritative
        </div>
      </div>

      <button
        type="button"
        aria-label={primaryLabel}
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
        className={[
          "h-10 w-10 rounded-full flex-shrink-0 grid place-items-center",
          "transition-transform transition-colors duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-danger)]",
          canSubmit && !submitting
            ? "bg-red text-white shadow-card hover:scale-[1.04] active:scale-[0.98]"
            : "bg-surface-strong text-ink/60 cursor-not-allowed border border-line/50",
        ].join(" ")}
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
