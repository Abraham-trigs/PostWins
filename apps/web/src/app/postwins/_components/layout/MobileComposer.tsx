// app/components/chat/MobileComposer.tsx
// Purpose: Mobile-optimized Composer fully aligned with desktop Composer logic (store-driven, optimistic-safe, REST-synced).

"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Paperclip,
  Send,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  AudioLines,
} from "lucide-react";

import { usePostWinStore } from "../chat/store/usePostWinStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import type { ChatMessage, NavigationContext } from "../chat/store/types";

import {
  createMessage,
  type BackendMessageType,
} from "@/lib/api/contracts/domain/message";

/* =========================================================
   Assumptions
   - usePostWinStore exposes: composerMode, composerText, submitting,
     setComposerMode, setComposerText, clearComposer,
     appendMessage, confirmMessage, rollbackMessage,
     activeCaseId, currentUserId
   - Backend createMessage matches desktop Composer contract
   - Attachments pipeline will be implemented server-side later
========================================================= */

/* =========================================================
   Design reasoning
   - Logic parity with desktop Composer ensures deterministic behavior.
   - Optimistic insert → backend sync → confirm/rollback is preserved.
   - Attachments remain local until submission (future upload pipeline).
   - Mobile-first layout without changing store or transport contracts.
========================================================= */

/* =========================================================
   Structure
   - Mode mapping
   - Navigation context builder
   - Optimistic submit flow
   - Attachment system (local)
   - Render
========================================================= */

type Mode = "record" | "followup" | "verify";
type AttachmentKind = "image" | "video" | "document" | "audio";

type Attachment = {
  id: string;
  kind: AttachmentKind;
  file: File;
};

/* =========================================================
   Mode → Backend Type Mapping
========================================================= */

function mapModeToMessageType(mode: Mode): BackendMessageType {
  switch (mode) {
    case "record":
      return "DISCUSSION";
    case "verify":
      return "VERIFICATION_REQUEST";
    case "followup":
      return "FOLLOW_UP";
    default:
      return "DISCUSSION";
  }
}

/* =========================================================
   Component
========================================================= */

export function MobileComposer() {
  const inputId = useId();

  /* ================= Store ================= */

  const mode = usePostWinStore((s) => s.composerMode) as Mode;
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

  /* ================= Local Attachments ================= */

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachOpen, setAttachOpen] = useState(false);
  const attachWrapRef = useRef<HTMLDivElement | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = text.trim().length > 0 || attachments.length > 0;

  /* ================= Placeholder ================= */

  const placeholder = useMemo(() => {
    if (mode === "record") return "Record an update…";
    if (mode === "followup") return "Add a follow-up…";
    return "Add a verification note…";
  }, [mode]);

  /* ================= Navigation Context ================= */

  function buildNavigationContext(): NavigationContext | null {
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

  /* ================= Click Outside ================= */

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        attachWrapRef.current &&
        !attachWrapRef.current.contains(e.target as Node)
      ) {
        setAttachOpen(false);
      }
    };

    if (attachOpen) {
      document.addEventListener("mousedown", handler);
    }

    return () => document.removeEventListener("mousedown", handler);
  }, [attachOpen]);

  /* =========================================================
     Optimistic Submit Logic (IDENTICAL DOMAIN FLOW)
  ========================================================= */

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    const trimmed = text.trim();
    const { tenantId } = useAuthStore.getState();

    if (!caseId || !currentUserId || !tenantId) return;

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
      // 1️⃣ Optimistic UI insert
      appendMessage(optimisticMessage);
      clearComposer();
      setAttachments([]);

      // 2️⃣ Backend sync
      const serverMessage = await createMessage({
        caseId,
        type: mapModeToMessageType(mode),
        body: trimmed,
        parentId: null,
        navigationContext: buildNavigationContext(),
        clientMutationId: tempId,
      });

      // 3️⃣ Confirm
      confirmMessage(tempId, serverMessage.id);
    } catch (err) {
      rollbackMessage(tempId);
      setComposerText(trimmed);
      console.error("MobileComposer submit failed:", err);
    }
  };

  /* ================= Attachments ================= */

  const triggerAttach = (kind: AttachmentKind) => {
    if (kind === "image") imageInputRef.current?.click();
    if (kind === "video") videoInputRef.current?.click();
    if (kind === "document") docInputRef.current?.click();
    if (kind === "audio") audioInputRef.current?.click();
  };

  const addFiles = (kind: AttachmentKind, files: FileList | null) => {
    if (!files) return;

    const next: Attachment[] = Array.from(files).map((file) => ({
      id: `${kind}:${file.name}:${file.size}:${file.lastModified}`,
      kind,
      file,
    }));

    setAttachments((prev) => {
      const seen = new Set(prev.map((a) => a.id));
      const merged = [...prev];
      for (const a of next) {
        if (!seen.has(a.id)) merged.push(a);
      }
      return merged;
    });

    setAttachOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  /* =========================================================
     Render
  ========================================================= */

  return (
    <footer className="px-4 py-3 flex flex-col gap-3 bg-paper border-t border-line/50">
      {/* Mode Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {(["record", "followup", "verify"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setComposerMode(m)}
            className={`px-3 h-8 rounded-full text-xs font-semibold ${
              mode === m ? "bg-ocean text-ink" : "text-ink/80 hover:bg-surface"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative" ref={attachWrapRef}>
          <button
            type="button"
            onClick={() => setAttachOpen((v) => !v)}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center"
          >
            <Paperclip size={16} />
          </button>

          <input
            id={inputId}
            value={text}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            className="w-full h-10 rounded-full pl-12 pr-4 bg-[#6b8d87] text-paper border border-line/50"
          />

          {attachOpen && (
            <div className="absolute left-2 bottom-12 bg-surface-strong border border-line/50 rounded-xl p-2">
              <button onClick={() => triggerAttach("image")}>
                <ImageIcon size={16} />
              </button>
              <button onClick={() => triggerAttach("video")}>
                <VideoIcon size={16} />
              </button>
              <button onClick={() => triggerAttach("document")}>
                <FileText size={16} />
              </button>
              <button onClick={() => triggerAttach("audio")}>
                <AudioLines size={16} />
              </button>
            </div>
          )}
        </div>

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`h-11 w-11 rounded-full grid place-items-center ${
            canSubmit ? "bg-red text-paper" : "bg-surface-strong text-ink/60"
          }`}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Attachment Chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="px-3 py-1 rounded-full bg-surface-strong border border-line/50 text-xs"
            >
              {a.file.name}
              <button onClick={() => removeAttachment(a.id)} className="ml-2">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles("image", e.target.files)}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles("video", e.target.files)}
      />
      <input
        ref={docInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => addFiles("document", e.target.files)}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles("audio", e.target.files)}
      />
    </footer>
  );
}

/* =========================================================
   Implementation guidance
   - Uses identical optimistic + confirm/rollback pattern.
   - Safe under WS race.
   - Attachments ready for future upload pipeline.
========================================================= */

/* =========================================================
   Scalability insight
   - Domain logic isolated in store.
   - Transport contract unchanged.
   - Attachment system extensible to pre-upload + signed URLs.
========================================================= */
