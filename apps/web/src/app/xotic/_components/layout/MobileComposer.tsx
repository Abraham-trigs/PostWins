// app/components/chat/MobileComposerPro.tsx — Mobile-optimized version of Composer with mode tabs, in-input attachments, chips, and send.
// Keeps the same interaction model as desktop Composer, but tuned for narrow widths.

"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react"; // Core hooks only; keep deps minimal and predictable.
import {
  Paperclip,
  Send,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  AudioLines,
} from "lucide-react";

type Mode = "record" | "followup" | "verify"; // Explicit modes keep UX + backend intent unambiguous.
type AttachmentKind = "image" | "video" | "document" | "audio"; // Narrowed kinds enable strict accept filters + server-side routing.

type Attachment = {
  id: string; // Deterministic id used for de-dupe and stable keying (prevents chip flicker).
  kind: AttachmentKind; // Drives labeling + server upload pipeline selection.
  file: File; // Raw File object for upload/mutation layer.
};

/**
 * MobileComposerPro
 * - Mobile-first version of your desktop Composer (keeps the same “feel”).
 * - Tabs become horizontally scrollable to avoid wrapping and layout jitter.
 * - Attachment icon stays inside input (left), menu opens upward.
 * - Send turns red when user can submit (typed text OR attachments).
 *
 * Palette rules preserved:
 * - Main surface: bg-paper (your globals maps paper to main surface)
 * - Input keeps bg-[#6b8d87]
 * - Red reserved for send + focus ring
 */
export function MobileComposerPro() {
  // Mode drives placeholder + send label + hint line, keeping user intent explicit.
  const [mode, setMode] = useState<Mode>("record");

  // Text draft state (trimmed at submit time; do not trim while typing to preserve user intent).
  const [text, setText] = useState("");

  // Attachments are stored locally until submit; server upload should happen in handleSubmit (or pre-upload).
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Attachment popover open/close state.
  const [attachOpen, setAttachOpen] = useState(false);

  // Stable id for input label association (a11y).
  const inputId = useId();

  // Hidden file inputs: separate refs per type keeps accept filters strict and UX obvious.
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Click-outside detection root for attachment popover.
  const attachWrapRef = useRef<HTMLDivElement | null>(null);

  // Submit is enabled when either meaningful text exists OR attachments exist.
  // This prevents empty sends while still allowing “attachment-only” messages.
  const canSubmit = text.trim().length > 0 || attachments.length > 0;

  // Placeholder guides the user by mode; memoized to avoid recompute noise.
  const placeholder = useMemo(() => {
    if (mode === "record") return "Record an update…";
    if (mode === "followup") return "Add a follow-up…";
    return "Add a verification note…";
  }, [mode]);

  // Send button accessible label; avoids ambiguous “Send” when modes change semantics.
  const primaryLabel = useMemo(() => {
    if (mode === "record") return "Send record";
    if (mode === "followup") return "Send follow-up";
    return "Send verification";
  }, [mode]);

  // Compact hint label under the input.
  const modeLabel = useMemo(() => {
    if (mode === "record") return "Record";
    if (mode === "followup") return "Follow-up";
    return "Verify";
  }, [mode]);

  // Close attachment menu on outside click.
  // Uses mousedown to close early (before focus/selection shifts) for a snappier UX.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const root = attachWrapRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) setAttachOpen(false);
    };

    if (attachOpen) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [attachOpen]);

  const addFiles = (kind: AttachmentKind, files: FileList | null) => {
    if (!files || files.length === 0) return;

    // File policy enforcement hook:
    // - Add max count, max total size, disallowed extensions, etc. here without touching UI wiring.
    const next: Attachment[] = Array.from(files).map((file) => ({
      // Deterministic id supports de-dupe across repeated selections.
      id: `${kind}:${file.name}:${file.size}:${file.lastModified}`,
      kind,
      file,
    }));

    // De-dupe by id to avoid duplicate chips when user selects the same file again.
    setAttachments((prev) => {
      const seen = new Set(prev.map((a) => a.id));
      const merged = [...prev];
      for (const a of next) if (!seen.has(a.id)) merged.push(a);
      return merged;
    });

    // Close popover immediately after selection for a “single action” feel.
    setAttachOpen(false);
  };

  const removeAttachment = (id: string) => {
    // Non-destructive remove (local only). Server-side delete would happen only after upload/submit.
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    // Replace with your mutation (optimistic insert + rollback on failure).
    // Recommended pattern:
    // 1) Snapshot local state
    // 2) Optimistically append to timeline/thread
    // 3) Upload attachments + send payload
    // 4) Roll back optimistic message on failure
    setText("");
    setAttachments([]);
  };

  const triggerAttach = (kind: AttachmentKind) => {
    // Single “router” keeps menu items dumb and prevents accept-type mismatch.
    if (kind === "image") imageInputRef.current?.click();
    if (kind === "video") videoInputRef.current?.click();
    if (kind === "document") docInputRef.current?.click();
    if (kind === "audio") audioInputRef.current?.click();
  };

  return (
    <footer
      aria-label="Message composer" // Screen-reader landmark for composing actions.
      className={[
        // Mobile spacing tuned (uses smaller padding than desktop).
        "flex-shrink-0",
        "px-4 py-3",
        "flex flex-col gap-3",
        // Dark surface.
        "bg-paper",
        // Top separator visible on dark.
        "border-t border-line/50",
      ].join(" ")}
    >
      {/* Mode selector: scrollable on mobile to prevent wrapping */}
      <div
        className={[
          "flex items-center gap-2",
          "rounded-full p-1",
          "bg-surface-strong border border-line/50",
          // Scroll behavior for small screens
          "overflow-x-auto scrollbar-none",
        ].join(" ")}
        aria-label="Composer controls"
      >
        <div
          role="tablist"
          aria-label="Entry type"
          className="flex items-center gap-1 min-w-max"
        >
          <ModeTab active={mode === "record"} onClick={() => setMode("record")}>
            Record
          </ModeTab>
          <ModeTab
            active={mode === "followup"}
            onClick={() => setMode("followup")}
          >
            Follow-up
          </ModeTab>
          <ModeTab active={mode === "verify"} onClick={() => setMode("verify")}>
            Verify
          </ModeTab>
        </div>
      </div>

      {/* Input row: input + send button */}
      <div className="flex items-center gap-3">
        {/* Input block: attachment icon lives inside the input */}
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor={inputId}>
            {mode === "record"
              ? "Record message"
              : mode === "followup"
              ? "Follow-up message"
              : "Verification message"}
          </label>

          {/* Wrapper anchors popover and supports click-outside logic */}
          <div className="relative" ref={attachWrapRef}>
            {/* Attachment button inside the input (left) */}
            <button
              type="button"
              aria-label="Add attachment"
              aria-haspopup="menu"
              aria-expanded={attachOpen}
              onClick={() => setAttachOpen((v) => !v)}
              className={[
                // Inside-input positioning.
                "absolute left-2 top-1/2 -translate-y-1/2",
                "h-8 w-8 rounded-full grid place-items-center",
                // Subtle on dark; hover reveals affordance.
                "text-ink/80 hover:text-ink",
                "hover:bg-surface transition-colors",
                // Focus ring for keyboard users (red per palette rule).
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-danger)]",
              ].join(" ")}
            >
              <Paperclip className="h-4.5 w-4.5" aria-hidden="true" />
            </button>

            {/* Text input (kept EXACTLY as you wanted) */}
            <input
              id={inputId}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => {
                // Enter-to-send behavior (chat-like).
                // Note: no Shift+Enter handling here; add textarea if multiline is required.
                if (e.key === "Enter") handleSubmit();
              }}
              className={[
                // Layout
                "w-full h-10 rounded-full pl-12 pr-4 text-sm",

                // Preserve your chosen background
                "bg-[#6b8d87]",

                // Use MAIN BACKGROUND COLOR for text + placeholder
                "text-paper placeholder:text-paper/60",

                // Definition + focus
                "border border-line/50",
                "focus:outline-none  focus-visible:ring-[var(--state-danger)]",
              ].join(" ")}
            />

            {/* Attachment menu popover (anchored to inside-button) */}
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
                  icon={
                    <ImageIcon className="h-4.5 w-4.5" aria-hidden="true" />
                  }
                  onClick={() => triggerAttach("image")}
                />
                <MenuItem
                  label="Video"
                  icon={
                    <VideoIcon className="h-4.5 w-4.5" aria-hidden="true" />
                  }
                  onClick={() => triggerAttach("video")}
                />
                <MenuItem
                  label="Document"
                  icon={<FileText className="h-4.5 w-4.5" aria-hidden="true" />}
                  onClick={() => triggerAttach("document")}
                />
                <MenuItem
                  label="Audio"
                  icon={
                    <AudioLines className="h-4.5 w-4.5" aria-hidden="true" />
                  }
                  onClick={() => triggerAttach("audio")}
                />
              </div>
            )}
          </div>

          {/* Attachment chips: show after the input, still within composer */}
          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 px-2">
              {attachments.map((a) => (
                <AttachmentChip
                  key={a.id}
                  attachment={a}
                  onRemove={() => removeAttachment(a.id)}
                />
              ))}
            </div>
          )}

          {/* Hint line: low contrast but readable on dark */}
          <div className="mt-1 px-3 text-[10px] uppercase tracking-wider font-semibold text-ink/60">
            {modeLabel} • Sync-safe • Idempotent
          </div>
        </div>

        {/* Send button: turns red when canSubmit */}
        <button
          type="button"
          aria-label={primaryLabel}
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={[
            "h-11 w-11 rounded-full flex-shrink-0 grid place-items-center",
            "transition-transform transition-colors duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-danger)]",
            canSubmit
              ? "bg-red text-paper shadow-card active:scale-[0.98]"
              : "bg-surface-strong text-ink/60 cursor-not-allowed border border-line/50",
          ].join(" ")}
        >
          <Send className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Hidden file inputs: kept inside the component so the menu can trigger each accept filter */}
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
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
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

/* =====================================================================================
   UI helpers (kept in-file for now; extract later if reused)
   ===================================================================================== */

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean; // Determines selected state styling and aria-selected.
  onClick: () => void; // Parent setter; keeps the tab dumb.
  children: React.ReactNode; // Label content.
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "h-8 px-3 rounded-full text-[11px] font-semibold tracking-wide",
        "transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-danger)]",
        active
          ? "bg-ocean text-ink"
          : "bg-transparent text-ink/80 hover:bg-surface",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function MenuItem({
  label,
  icon,
  onClick,
}: {
  label: string; // Visible label; ensures menu is readable and not icon-only.
  icon: React.ReactNode; // Icon is optional but helpful for scanning.
  onClick: () => void; // Triggers hidden file input click.
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3",
        "rounded-[var(--xotic-radius-sm)] px-3 py-2",
        "text-sm text-ink",
        "hover:bg-surface-muted transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-danger)]",
      ].join(" ")}
    >
      <span className="text-ink/70">{icon}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: Attachment; // Contains kind + file metadata for display.
  onRemove: () => void; // Local removal handler.
}) {
  // Memoize label construction for stable rendering when parent updates.
  const label = useMemo(() => {
    const kind =
      attachment.kind === "image"
        ? "Image"
        : attachment.kind === "video"
        ? "Video"
        : attachment.kind === "audio"
        ? "Audio"
        : "Doc";
    return `${kind}: ${attachment.file.name}`;
  }, [attachment]);

  return (
    <div
      className={[
        "max-w-full inline-flex items-center gap-2",
        "rounded-full px-3 py-1 text-xs",
        "bg-surface-strong border border-line/50 text-ink",
      ].join(" ")}
      title={attachment.file.name} // Allows full filename discovery on hover.
    >
      {/* Kind pill helps users parse multiple attachments quickly */}
      <span className="inline-flex items-center rounded-full bg-ocean/30 px-2 py-0.5 text-[10px] font-semibold text-ink">
        {attachment.kind}
      </span>

      {/* Filename is clamped to avoid blowing up composer width */}
      <span className="truncate max-w-[16rem] text-ink/85">{label}</span>

      {/* Remove: local-only, safe and reversible until submit */}
      <button
        type="button"
        aria-label={`Remove ${attachment.file.name}`}
        onClick={onRemove}
        className={[
          "h-5 w-5 rounded-full grid place-items-center",
          "border border-line/50",
          "text-ink/70 hover:text-ink hover:bg-surface",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-danger)]",
          "transition-colors",
        ].join(" ")}
      >
        <span aria-hidden="true" className="text-[12px] leading-none">
          ×
        </span>
      </button>
    </div>
  );
}
