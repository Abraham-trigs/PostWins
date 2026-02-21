// apps/website/src/app/about/aboutNarrate.ts
// Purpose: Page-scoped role narrative for the About page.

import type { PrimaryRole } from "@/_lib/experience.types";

/* =========================================================
   Design reasoning
   =========================================================
   About is conviction + philosophy.
   This file isolates role framing from global product copy.
   No UI logic — narrative only.
*/

/* =========================================================
   Types
   ========================================================= */

export type AboutRole = Exclude<PrimaryRole, null>;

export interface AboutNarrative {
  hero: {
    title: string;
    subtitle: string;
  };
  closing: {
    headline: string;
    body: string;
  };
}

/* =========================================================
   Narrative Map
   ========================================================= */

const ABOUT_NARRATIVE: Record<AboutRole, AboutNarrative> = {
  donor: {
    hero: {
      title: "Accountability is Architectural.",
      subtitle: "Funding environments demand traceability, not assumptions.",
    },
    closing: {
      headline: "Funding Must Be Defensible.",
      body: "PostWins exists to transform financial allocation into structured, provable institutional impact.",
    },
  },

  regulator: {
    hero: {
      title: "Compliance is Engineered.",
      subtitle:
        "High-governance environments cannot rely on human memory or informal workflows.",
    },
    closing: {
      headline: "Governance Must Be Systemic.",
      body: "We build systems where enforcement is structural and oversight is embedded.",
    },
  },

  operator: {
    hero: {
      title: "Correctness Enables Speed.",
      subtitle: "Operational clarity eliminates friction and systemic risk.",
    },
    closing: {
      headline: "Velocity Through Structure.",
      body: "Deterministic lifecycle enforcement accelerates execution without sacrificing integrity.",
    },
  },

  technical: {
    hero: {
      title: "Deterministic Systems Over Assumptions.",
      subtitle:
        "Governance is not UI. It is service-layer orchestration and relational integrity.",
    },
    closing: {
      headline: "Architecture Is Policy.",
      body: "We design infrastructure that rejects invalid state transitions at protocol level.",
    },
  },

  observer: {
    hero: {
      title: "Trust Must Be Structural.",
      subtitle:
        "Institutions deserve systems that reduce ambiguity, not amplify it.",
    },
    closing: {
      headline: "Reduce Systemic Ambiguity.",
      body: "Our mission is to engineer execution infrastructure for environments where uncertainty is unacceptable.",
    },
  },
};

/* =========================================================
   Resolver
   ========================================================= */

export function getAboutNarrative(
  role: PrimaryRole | null | undefined,
): AboutNarrative {
  if (!role || !(role in ABOUT_NARRATIVE)) {
    return ABOUT_NARRATIVE.observer;
  }

  return ABOUT_NARRATIVE[role as AboutRole];
}
