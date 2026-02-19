// apps/website/src/app/impact/impactNarrate.ts
// Purpose: Defines role-based narrative framing for the Impact page only.
// This file is page-scoped and must not replace global stakeholder-content.ts.

import type { PrimaryRole } from "@/_lib/experience.types";

/* =========================================================
   Assumptions
   =========================================================
   - PrimaryRole includes: donor | regulator | operator | technical | observer | null
   - This file is consumed only by ImpactClient.tsx
   - ImpactSection remains presentation-only and static
*/

/* =========================================================
   Design reasoning
   =========================================================
   This file isolates Impact-page narrative from global product copy.
   It prevents overloading STAKEHOLDER_COPY while keeping role
   personalization deterministic and modular.

   Impact messaging focuses on measurable outcomes and institutional
   defensibility rather than architectural depth.
*/

/* =========================================================
   Types
   ========================================================= */

export type ImpactRole = Exclude<PrimaryRole, null>;

export interface ImpactNarrative {
  hero: {
    title: string;
    subtitle: string;
  };
  cta: {
    headline: string;
    body: string;
  };
}

/* =========================================================
   Narrative Map
   ========================================================= */

const IMPACT_NARRATIVE: Record<ImpactRole, ImpactNarrative> = {
  donor: {
    hero: {
      title: "Defensible Funding Outcomes.",
      subtitle:
        "Every allocation is policy-validated, ledger-recorded, and audit-ready.",
    },
    cta: {
      headline: "See measurable funding execution.",
      body: "Explore how deterministic governance transforms financial support into provable impact.",
    },
  },

  regulator: {
    hero: {
      title: "Compliance-Verified Impact.",
      subtitle:
        "Operational results backed by structured lifecycle enforcement.",
    },
    cta: {
      headline: "Validate institutional compliance outcomes.",
      body: "Review how architectural enforcement reduces regulatory exposure and ensures auditability.",
    },
  },

  operator: {
    hero: {
      title: "Operational Velocity Without Risk.",
      subtitle:
        "Accelerate workflows while maintaining structural correctness.",
    },
    cta: {
      headline: "Eliminate execution ambiguity.",
      body: "See how deterministic routing improves speed and reduces systemic friction across the lifecycle.",
    },
  },

  technical: {
    hero: {
      title: "Architecturally Enforced Outcomes.",
      subtitle:
        "Impact becomes measurable when state transitions are deterministic.",
    },
    cta: {
      headline: "Examine the enforcement model.",
      body: "Understand how relational integrity and service-layer orchestration ensure provable results.",
    },
  },

  observer: {
    hero: {
      title: "Provable Institutional Impact.",
      subtitle:
        "Governance infrastructure that transforms trust into measurable, public progress.",
    },
    cta: {
      headline: "Monitor the ecosystem.",
      body: "Observe how structured transparency creates a verifiable record of institutional evolution.",
    },
  },
};

/* =========================================================
   Safe Resolver
   ========================================================= */

/**
 * Resolves narrative by role with fallback.
 * Ensures deterministic behavior and prevents undefined access.
 */
export function getImpactNarrative(
  role: PrimaryRole | null | undefined,
): ImpactNarrative {
  if (!role || !(role in IMPACT_NARRATIVE)) {
    return IMPACT_NARRATIVE.observer;
  }

  return IMPACT_NARRATIVE[role as ImpactRole];
}

/* =========================================================
   Structure
   =========================================================
   - ImpactRole type
   - ImpactNarrative interface
   - IMPACT_NARRATIVE internal map
   - getImpactNarrative resolver (exported)
*/

/* =========================================================
   Implementation guidance
   =========================================================
   In ImpactClient.tsx:

   import { getImpactNarrative } from "../impactNarrate";

   const role = useSafeExperienceStore((s) => s.primaryRole);
   const narrative = getImpactNarrative(role);
*/

/* =========================================================
   Scalability insight
   =========================================================
   This pattern allows:
   - Page-level A/B testing
   - Future localization per page
   - Server-side role resolution without UI changes
   - Strict compile-time safety for new roles
*/
