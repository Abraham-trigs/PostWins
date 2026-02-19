// apps/website/src/_store/useExperienceStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ExperienceState, PrimaryRole } from "../_lib/experience.types";
import { useEffect, useState } from "react";

interface ExperienceActions {
  setPrimaryRole: (role: PrimaryRole) => void;
  setInfrastructureInterest: (value: boolean) => void;
  markSurveyComplete: () => void;
  reset: () => void;
}

export type ExperienceStore = ExperienceState & ExperienceActions;

export const useExperienceStore = create<ExperienceStore>()(
  persist(
    (set) => ({
      primaryRole: null,
      infrastructureInterest: false,
      hasCompletedSurvey: false,

      setPrimaryRole: (role) => set({ primaryRole: role }),
      setInfrastructureInterest: (value) =>
        set({ infrastructureInterest: value }),
      markSurveyComplete: () => set({ hasCompletedSurvey: true }),
      reset: () =>
        set({
          primaryRole: null,
          infrastructureInterest: false,
          hasCompletedSurvey: false,
        }),
    }),
    {
      name: "dimpact-exp-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export function useSafeExperienceStore<T>(
  selector: (state: ExperienceStore) => T,
): T | null {
  const [data, setData] = useState<T | null>(null);
  const result = useExperienceStore(selector);
  useEffect(() => {
    useExperienceStore.persist.rehydrate();
    setData(result);
  }, [result]);
  return data;
}

// // apps/website/src/_store/useExperienceStore.ts
// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import { useState, useEffect } from "react";

// // ... existing types ...

// export const useExperienceStore = create<ExperienceStore>()(
//   persist(
//     (set) => ({
//       primaryRole: null,
//       hasCompletedSurvey: false,
//       setPrimaryRole: (role) => set({ primaryRole: role }),
//       markSurveyComplete: () => set({ hasCompletedSurvey: true }),
//     }),
//     {
//       name: "posta-exp-v1",
//       storage: createJSONStorage(() => localStorage),
//       skipHydration: true, // Crucial: Prevents Next.js from crashing on load
//     }
//   )
// );

// /**
//  * CUSTOM HOOK: useSafeStore
//  * Use this in your components to safely access the store
//  * without causing Next.js 15 hydration errors.
//  */
// export function useSafeStore<T>(selector: (state: ExperienceStore) => T): T | null {
//   const [data, setData] = useState<T | null>(null);
//   const result = useExperienceStore(selector);

//   useEffect(() => {
//     // Manually trigger hydration on the client only
//     useExperienceStore.persist.rehydrate();
//     setData(result);
//   }, [result]);

//   return data;
// }
