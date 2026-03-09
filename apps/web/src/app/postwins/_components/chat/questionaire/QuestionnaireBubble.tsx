// components/chat/QuestionnaireBubble.tsx
/**
 * Design reasoning:
 * Optimized for a unified "Session" UX. The local progress bar is removed to
 * avoid competing with the global header. The Global Loader is triggered
 * on the first user interaction (Step 0) and remains active throughout the
 * questionnaire and final bootstrap sync, providing a continuous "Processing"
 * signal in the header.
 *
 * Structure:
 * - QuestionnaireBubble: Multi-step intake form.
 * - handleAnswer: Transitions steps and initiates the Global Loader session.
 * - handleSubmit: Terminal async sync; handles the final Loader termination.
 *
 * Implementation guidance:
 * Place this in the chat feed. It communicates directly with the useLoaderStore
 * via useGlobalLoader. Ensure the header ProgressLoader is rendered to see results.
 *
 * Scalability insight:
 * By delegating the "active" state to the global store, the system can
 * eventually prevent navigation or other disruptive actions while an intake
 * is in progress.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Loader2,
  SendHorizontal,
  CheckCircle2,
  UserPlus,
  Search,
  Phone,
  ShieldAlert,
} from "lucide-react";

import { caseQuestions } from "./caseQuestions";
import { buildNarrative } from "./buildNarrative";
import { usePostWinStore } from "@postwin-store/usePostWinStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useGlobalLoader } from "../hooks/useGlobalLoader";

export function QuestionnaireBubble() {
  const submitBootstrap = usePostWinStore((s) => s.submitBootstrap);
  const appendMessage = usePostWinStore((s) => s.appendMessage);
  const patchDraft = usePostWinStore((s) => s.patchDraft);

  // 🚀 Logic only: Communicates with useLoaderStore
  const { startLoading, stopLoading } = useGlobalLoader();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Profile creation state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newBeni, setNewBeni] = useState({ displayName: "", phone: "" });

  const inputRef = useRef<HTMLInputElement>(null);

  const question = caseQuestions[step];
  const isLastStep = step === caseQuestions.length - 1;

  useEffect(() => {
    inputRef.current?.focus();
  }, [step, isCreatingNew]);

  if (!question) return null;

  async function handleAnswer(selectedValue?: string, displayLabel?: string) {
    const finalValue = selectedValue ?? value.trim();
    const chatText = displayLabel ?? finalValue;

    if (!finalValue || loading || !question) return;

    // 🚀 Start Global Loader on the very first answer (Session Start)
    if (step === 0) startLoading();

    const updatedAnswers: Record<string, string> = {
      ...answers,
      [question.id]: finalValue,
    };

    setAnswers(updatedAnswers);
    setValue("");
    setIsCreatingNew(false);

    appendMessage({
      id: crypto.randomUUID(),
      kind: "text",
      role: "user",
      mode: "record",
      text: chatText,
      createdAt: new Date().toISOString(),
    });

    const narrative = buildNarrative(updatedAnswers);
    patchDraft({ narrative });

    if (!isLastStep) {
      const nextQuestion = caseQuestions[step + 1];
      setTimeout(() => {
        appendMessage({
          id: crypto.randomUUID(),
          kind: "text",
          role: "system",
          mode: "record",
          text: nextQuestion?.label || "",
          createdAt: new Date().toISOString(),
        });
        setStep(step + 1);
      }, 400);
      return;
    }

    // Process last step submission
    await handleSubmit(updatedAnswers, narrative);
  }

  async function handleSubmit(
    draft: Record<string, string>,
    narrative: string,
  ) {
    setLoading(true);

    try {
      await submitBootstrap({
        submit: async () => {
          const auth = useAuthStore.getState();
          const tenantId = auth.user?.tenantId || auth.tenantId;
          if (!tenantId) throw new Error("Missing Tenant Context");

          const syncId = crypto.randomUUID();
          const res = await fetch("/api/intake/bootstrap", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "x-idempotency-key": syncId,
              "x-transaction-id": syncId,
              "x-tenant-id": tenantId,
            },
            body: JSON.stringify({
              narrative,
              category: draft.category || "Other",
              location: draft.location || "Unknown",
              beneficiaryId: draft.beneficiaryId || null,
              language: "en",
              sdgGoals: [],
              autoRoute: true,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data?.ok) {
            if (data?.error === "INTAKE_BLOCKED_HIGH_SEVERITY_ANOMALY") {
              const flag = data?.flags?.[0];
              let description = "Anomaly detected in submission.";
              if (flag?.type === "DUPLICATE_CLAIM")
                description = "Duplicate narrative detected.";

              toast.error("Integrity Rejection", {
                description,
                duration: 6000,
                icon: <ShieldAlert className="w-4 h-4 text-red-500" />,
              });
              throw new Error("ANOMALY_DETECTED");
            }
            throw new Error(data?.error || "Bootstrap failed");
          }

          return {
            ok: true,
            projectId: data.projectId,
            referenceCode: data.referenceCode,
          };
        },
      });
    } catch (err: any) {
      if (err.message !== "ANOMALY_DETECTED") {
        console.error("Bootstrap Final Error:", err.message);
        toast.error("Process Failed", { description: err.message });
      }
    } finally {
      setLoading(false);
      // 🚀 Stop Global Loader (Session End + Ghost Flash)
      stopLoading();
    }
  }

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden transition-all max-w-[340px]">
      {/* 🚀 Local progress bar removed per instruction */}

      <div className="p-5 pt-6">
        <header className="flex justify-between items-center mb-4">
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
            Step {step + 1} of {caseQuestions.length}
          </span>
        </header>

        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4 leading-relaxed">
          {question.label}
        </h3>

        {question.type === "beneficiary_select" ? (
          <div className="space-y-2">
            {isCreatingNew ? (
              <div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-1">
                <input
                  ref={inputRef}
                  className="w-full bg-white dark:bg-zinc-900 p-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 outline-none"
                  placeholder="Full Name"
                  value={newBeni.displayName}
                  onChange={(e) =>
                    setNewBeni({ ...newBeni, displayName: e.target.value })
                  }
                />
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    className="w-full bg-white dark:bg-zinc-900 pl-8 pr-2 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 outline-none"
                    placeholder="Phone Number"
                    value={newBeni.phone}
                    onChange={(e) =>
                      setNewBeni({ ...newBeni, phone: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setIsCreatingNew(false)}
                    className="flex-1 py-2 text-xs text-zinc-500 hover:text-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!newBeni.displayName || !newBeni.phone}
                    onClick={() =>
                      handleAnswer(JSON.stringify(newBeni), newBeni.displayName)
                    }
                    className="flex-1 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Confirm Profile
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    ref={inputRef}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder={question.placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => {
                    setNewBeni({ ...newBeni, displayName: value });
                    setIsCreatingNew(true);
                  }}
                  className="w-full flex items-center gap-2 p-3 text-sm text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-dashed border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create New Beneficiary Profile</span>
                </button>
              </>
            )}
          </div>
        ) : question.type === "select" ? (
          <div className="grid gap-2">
            {question.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className={`text-left px-3 py-2.5 text-sm rounded-lg border transition-all ${
                  value === opt
                    ? "border-blue-500 bg-blue-50 text-blue-600 font-medium"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/30"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              ref={inputRef}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder={question.placeholder || "Type your answer..."}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAnswer();
                }
              }}
              disabled={loading}
            />
            <button
              onClick={() => handleAnswer()}
              disabled={!value.trim() || loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40"
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
        )}
      </div>
    </div>
  );
}

/**
 * Integration notes:
 * - Session Loader: One start (Step 0), One stop (finally block).
 * - UI Logic: Header ProgressLoader is the only active tracker for this component.
 */
