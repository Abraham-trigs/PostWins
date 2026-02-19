// app/components/chat/ComposerInput.tsx — Shared input used by desktop Composer + MobileComposer.
// Maintains the exact color + focus styling requested.

"use client";

import type { ReactNode } from "react";

export function ComposerInput({
  inputId,
  value,
  onChange,
  placeholder,
  onEnter,
  leftInside,
  rightInside,
}: {
  inputId: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onEnter: () => void;
  leftInside?: ReactNode; // e.g. attachment button (paperclip)
  rightInside?: ReactNode; // e.g. clear button, emoji, etc.
}) {
  return (
    <div className="relative w-full">
      {/* Left inside element */}
      {leftInside ? (
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          {leftInside}
        </div>
      ) : null}

      {/* Right inside element */}
      {rightInside ? (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {rightInside}
        </div>
      ) : null}

      <input
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          // Enter-to-send behavior (chat-like).
          // Note: no Shift+Enter handling here; add textarea if multiline is required.
          if (e.key === "Enter") onEnter();
        }}
        className={[
          // Layout (responsive-safe: min-w-0 prevents flex overflow)
          "w-full min-w-0 h-10 rounded-full pl-12 pr-4 text-sm",
          // Preserve your chosen background
          "bg-[#6b8d87]",

          // Use MAIN BACKGROUND COLOR for text + placeholder
          "text-paper placeholder:text-paper/60",

          // Definition + focus
          "border border-line/50",
          "focus:outline-none focus-visible:ring- focus-visible:ring-[var(--state-danger)]",

          // If rightInside exists, give the input space so text doesn't collide
          rightInside ? "pr-12" : "",
        ].join(" ")}
      />
    </div>
  );
}
