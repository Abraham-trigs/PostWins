// apps/website/src/_components/ExperienceSurvey.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useExperienceStore } from "../_store/useExperienceStore";
import { PRIMARY_ROLES, PrimaryRole } from "../_lib/experience.types";
import { ChevronRightIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { telemetry } from "../_lib/analytics.client";

/**
 * Design reasoning:
 * This component derives stakeholder identity and must:
 * - Persist role deterministically
 * - Log intent safely
 * - Close intercepted modal context cleanly
 *
 * Structure:
 * - Local temp selection state
 * - Telemetry capture (non-blocking)
 * - Store commit
 * - Router replace to collapse parallel modal slot
 *
 * Scalability insight:
 * If identity derivation expands (multi-step wizard),
 * move routing logic into a dedicated orchestration hook.
 */

const roleDescriptions: Record<string, string> = {
  donor: "Verify impact ROI through audit-backed execution and ledger history.",
  regulator:
    "Enforce policy compliance via deterministic state machine modeling.",
  operator:
    "Accelerate humanitarian velocity through structured lifecycle routing.",
  technical:
    "Manage multi-tenant isolation and relational integrity constraints.",
  observer: "Explore deterministic infrastructure for high-governance impact.",
};

export default function ExperienceSurvey() {
  const router = useRouter();
  const [tempRole, setTempRole] = useState<PrimaryRole>(null);
  const { setPrimaryRole, markSurveyComplete } = useExperienceStore();

  const handleRoleSelection = (role: PrimaryRole) => {
    setTempRole(role);

    telemetry.capture("role_selected", {
      role_intent: role,
      context: "LIFECYCLE_INTAKE",
    });
  };

  const handleConfirm = () => {
    if (!tempRole) return;

    telemetry.capture("experience_confirmed", {
      final_role: tempRole,
      path: window.location.pathname,
      enforcement: "POLICY_VALIDATED",
    });

    setPrimaryRole(tempRole);
    markSurveyComplete();

    // Critical: Replace route to collapse intercepted modal slot
    router.replace(`/experience/${tempRole}`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden border border-slate-800 shadow-2xl rounded-3xl">
      <div className="p-8 pb-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 mb-3"
        >
          <div className="h-1 w-6 rounded-full bg-blue-600" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-blue-500 font-bold">
            Protocol: Identity_Derivation
          </span>
        </motion.div>

        <h2 className="text-3xl font-black tracking-tighter text-white">
          Select your perspective.
        </h2>

        <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-xs">
          PostWins enforces role-based capability derivation at the
          infrastructure level.
        </p>
      </div>

      <div className="p-6 space-y-3 flex-1 overflow-y-auto max-h-[420px] scrollbar-hide">
        {PRIMARY_ROLES.map((role) => (
          <motion.button
            key={role}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelection(role)}
            className={`w-full group flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
              tempRole === role
                ? "border-blue-600 bg-blue-600/5 shadow-[0_0_30px_rgba(37,99,235,0.05)]"
                : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
            }`}
          >
            <div
              className={`mt-1.5 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                tempRole === role
                  ? "border-blue-500 bg-blue-500"
                  : "border-slate-700"
              }`}
            >
              {tempRole === role && (
                <CheckCircleIcon className="h-3 w-3 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "block font-bold capitalize transition-colors",
                  tempRole === role
                    ? "text-white"
                    : "text-slate-400 group-hover:text-slate-200",
                )}
              >
                {role}
              </span>

              <span className="block text-[11px] text-slate-500 mt-1 leading-normal font-medium italic">
                {roleDescriptions[role as string]}
              </span>
            </div>

            <ChevronRightIcon
              className={`h-4 w-4 mt-2 transition-transform ${
                tempRole === role
                  ? "text-blue-500 translate-x-1"
                  : "text-slate-800"
              }`}
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {tempRole && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="p-6 bg-slate-950 border-t border-slate-800"
          >
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold tracking-tight shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group"
            >
              Confirm {tempRole.replace("_", " ")} Authority
              <ChevronRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-[9px] text-center text-slate-600 mt-4 font-mono uppercase tracking-widest">
              Executing Deterministic State Transition...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
