"use client";

import { useState, useEffect, useRef } from "react";
import { caseQuestions } from "./caseQuestions";
import { buildNarrative } from "./buildNarrative";
import { usePostWinStore } from "@postwin-store/usePostWinStore";
import { Loader2, SendHorizontal, CheckCircle2 } from "lucide-react"; // Optional: lucide-react

export function QuestionnaireBubble() {
  const submitBootstrap = usePostWinStore((s) => s.submitBootstrap);
  const appendMessage = usePostWinStore((s) => s.appendMessage);
  const patchDraft = usePostWinStore((s) => s.patchDraft);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLastStep = step === caseQuestions.length - 1;
  const question = caseQuestions[step];
  const progress = ((step + 1) / caseQuestions.length) * 100;

  // Auto-focus input on every step change
  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  async function handleAnswer() {
    if (!value.trim() || loading) return;

    const answer = value.trim();
    const updatedAnswers = { ...answers, [question.id]: answer };

    setAnswers(updatedAnswers);
    setValue("");

    // 1. Log User Answer in Chat
    appendMessage({
      id: crypto.randomUUID(),
      kind: "text",
      role: "user",
      mode: "record",
      text: answer,
      createdAt: new Date().toISOString(),
    });

    // 2. Update Narrative Logic
    const narrative = buildNarrative(updatedAnswers);
    patchDraft({ narrative });

    if (!isLastStep) {
      const nextQuestion = caseQuestions[step + 1];

      // Delay system message slightly for "natural" feel
      setTimeout(() => {
        appendMessage({
          id: crypto.randomUUID(),
          kind: "text",
          role: "system",
          mode: "record",
          text: nextQuestion.label,
          createdAt: new Date().toISOString(),
        });
        setStep(step + 1);
      }, 400);
    } else {
      await handleSubmit(updatedAnswers, narrative);
    }
  }

  async function handleSubmit(
    draft: Record<string, string>,
    narrative: string,
  ) {
    setLoading(true);
    try {
      await submitBootstrap({
        submit: async () => {
          const res = await fetch("/api/intake/bootstrap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              narrative,
              category: draft.category,
              location: draft.location,
            }),
          });
          const data = await res.json();
          if (!data?.ok) throw new Error();
          return {
            ok: true,
            projectId: data.projectId,
            referenceCode: data.referenceCode,
          };
        },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden transition-all max-w-[340px]">
      {/* Progress Line */}
      <div className="absolute top-0 left-0 h-1 bg-zinc-100 dark:bg-zinc-800 w-full">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5 pt-6">
        <header className="flex justify-between items-center mb-4">
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
            Step {step + 1} of {caseQuestions.length}
          </span>
        </header>

        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4 leading-relaxed">
          {question.label}
        </h3>

        <div className="space-y-3">
          {question.type === "select" ? (
            <div className="grid grid-cols-1 gap-2">
              {question.options?.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setValue(opt);
                  }}
                  className={`text-left px-3 py-2 text-sm rounded-lg border transition-all ${
                    value === opt
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <input
              ref={inputRef}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder={question.placeholder || "Type your answer..."}
              value={value}
              onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
            />
          )}

          <button
            onClick={handleAnswer}
            disabled={!value || loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:grayscale transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLastStep ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Initialization
              </>
            ) : (
              <>
                Continue
                <SendHorizontal className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
