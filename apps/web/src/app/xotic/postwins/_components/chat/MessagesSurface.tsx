// scrollRef
"use client";

import React from "react";
import { Activity } from "lucide-react";

import type { ChatMessage, ComposerMode } from "./store/types";
import { usePostWinStore } from "./store/usePostWinStore";

// Questionnaire UIs
import Step1Question from "./questionaire/Step1Question";
import Step2Beneficiary from "./questionaire/Step2Beneficiary";
import ReviewStep from "./questionaire/ReviewStep";

import { DecisionButton } from "./UI/DecisionButton";

type Action = { id: string; label: string; value: string };

export function MessagesSurface() {
  const messages = usePostWinStore((s) => s.messages);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages.length]);

  const handleAction = (action: Action) => {
    const store = usePostWinStore.getState();

    switch (action.value) {
      case "edit":
        store.goToQuestionnaireStep("step1_location");
        break;

      case "confirm":
        store.upsertEvent({
          key: "replay-sync",
          title: "Sync complete",
          meta: "All offline actions have been applied",
          status: "logged",
        });

        store.finalizeQuestionnaire();
        break;

      default:
        break;
    }
  };

  return (
    <div
      aria-label="Messages surface"
      className="h-full w-full rounded-[var(--xotic-radius)] border border-line/50 bg-paper overflow-hidden flex flex-col"
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-none p-[var(--xotic-pad-4)]"
      >
        <div className="mx-auto w-full max-w-3xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-line/50 bg-surface-strong text-xs text-ink/70">
                <Activity className="h-4 w-4 text-ocean" aria-hidden="true" />
                No messages yet
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <MessageRow key={m.id} msg={m} onAction={handleAction} />
            ))
          )}

          {/* Bottom spacer to avoid composer crowding */}
          <div className="h-6" />
        </div>
      </div>

      {/* Bottom surface divider */}
      <div className="h-3 border-t border-line/50 bg-surface-strong" />
    </div>
  );
}

/* =========================================================
   Message Row
========================================================= */

function MessageRow({
  msg,
  onAction,
}: {
  msg: ChatMessage;
  onAction: (action: Action) => void;
}) {
  switch (msg.kind) {
    case "text":
      return <TextBubble role={msg.role} text={msg.text} mode={msg.mode} />;

    case "event":
      return (
        <EventCard title={msg.title} meta={msg.meta} status={msg.status} />
      );

    case "form_block":
      return <FormBlock step={msg.step} />;

    case "action_row":
      return <ActionRow actions={msg.actions} onAction={onAction} />;

    default:
      return null;
  }
}

/* =========================================================
   Text / Event UI
========================================================= */

function TextBubble({
  role,
  text,
  mode,
}: {
  role: Extract<ChatMessage, { kind: "text" }>["role"];
  text: string;
  mode: ComposerMode;
}) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%] space-y-1">
        <div
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            isUser ? "text-ink/60 text-right" : "text-ink/60"
          }`}
        >
          {mode}
        </div>

        <div
          className={[
            "rounded-[var(--xotic-radius)] border border-line/50 px-4 py-2 text-sm",
            isUser ? "bg-surface-strong text-ink" : "bg-surface text-ink",
          ].join(" ")}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function EventCard({
  title,
  meta,
  status,
}: {
  title: string;
  meta: string;
  status: "logged" | "pending" | "failed";
}) {
  return (
    <div className="rounded-[var(--xotic-radius)] border border-line/50 bg-surface p-4">
      <div className="text-sm font-medium text-ink">{title}</div>
      <div className="text-xs text-ink/65">{meta}</div>
      <div className="mt-2 text-xs text-ink/70">
        {status === "logged"
          ? "Logged"
          : status === "pending"
            ? "Pending"
            : "Failed"}
      </div>
    </div>
  );
}

/* =========================================================
   In-chat Form Rendering
========================================================= */

function FormBlock({
  step,
}: {
  step: Extract<ChatMessage, { kind: "form_block" }>["step"];
}) {
  const { questionnaire, answerQuestion } = usePostWinStore();

  switch (step) {
    case "step1_location":
      return (
        <div className="rounded-[var(--xotic-radius)] border border-line/50 bg-surface p-4">
          <Step1Question
            value={questionnaire.answers.location}
            onAnswer={(value) => answerQuestion("location", value)}
          />
        </div>
      );

    case "beneficiary":
      return (
        <div className="rounded-[var(--xotic-radius)] border border-line/50 bg-surface p-4">
          <Step2Beneficiary
            value={questionnaire.answers.beneficiary}
            onAnswer={(value) => answerQuestion("beneficiary", value)}
          />
        </div>
      );

    case "review":
      return (
        <div className="rounded-[var(--xotic-radius)] border border-line/50 bg-surface p-4">
          <ReviewStep answers={questionnaire.answers} />
        </div>
      );

    default:
      return (
        <div className="rounded-[var(--xotic-radius)] border border-line/50 bg-surface p-4">
          <div className="text-sm font-semibold text-ink">Form: {step}</div>
          <div className="text-xs text-ink/65 mt-1">
            (Renderer not implemented yet.)
          </div>
        </div>
      );
  }
}

/* =========================================================
   Action Row
========================================================= */

function ActionRow({
  actions,
  onAction,
}: {
  actions: Extract<ChatMessage, { kind: "action_row" }>["actions"];
  onAction: (action: Action) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <DecisionButton
          key={a.id}
          variant={a.value === "confirm" ? "primary" : "secondary"}
          onClick={() => onAction(a)}
        >
          {a.label}
        </DecisionButton>
      ))}
    </div>
  );
}
